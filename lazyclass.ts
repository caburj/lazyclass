// deno-lint-ignore-file no-explicit-any
type Constructor<T> = new (...args: unknown[]) => T;
type Initialized = { initialize(...args: unknown[]): void };
type ExtensionDefinition<Base extends Initialized, Extension extends Base> = {
  getCompiled(): Constructor<Extension>;
  instantiate(...args: Parameters<Extension['initialize']>): Extension;
  isInstance(obj: unknown): boolean;
  getBase(): BaseCallback<Base>;
};
type BaseDefinition<Base extends Initialized> = ExtensionDefinition<Base, Base>;
type BaseCallback<T> = () => Constructor<T>;
type ExtensionCallback<B, T> = (base: Constructor<B>) => Constructor<T>;

const extensions: Map<
  BaseCallback<any>,
  ExtensionCallback<any, any>[]
> = new Map();

/**
 * Defines a lazy class.
 *
 * @param callback - use to lazily define the class
 * @returns a definition used to interface with the lazy class
 */
function defclass<Base extends Initialized>(
  callback: BaseCallback<Base>
): BaseDefinition<Base> {
  let compiled: Constructor<Base> | undefined;
  const extensionCBs: ExtensionCallback<Base, Base>[] = [];
  extensions.set(callback, extensionCBs);
  return {
    getCompiled(): Constructor<Base> {
      if (compiled) {
        return compiled;
      }
      compiled = extensionCBs.reduce((acc, cb) => cb(acc), callback());
      return compiled;
    },
    instantiate(...args: Parameters<Base['initialize']>): Base {
      const Class = this.getCompiled();
      const newInstance = new Class();
      newInstance.initialize(...args);
      return newInstance;
    },
    isInstance(obj: Base) {
      const result = obj instanceof this.getCompiled();
      return result;
    },
    getBase() {
      return callback;
    },
  };
}

/**
 * Extends a lazy class definition using an extension callback.
 *
 * @param def - from the result of `defclass`
 * @param extension - a callback to apply to the lazy class.
 * @returns the given definition but typed to have the extension.
 */
function extend<Base extends Initialized = any, Extension extends Base = any>(
  def: BaseDefinition<Base>,
  extension: ExtensionCallback<Base, Extension>
): ExtensionDefinition<Base, Extension> {
  const base = def.getBase();
  const extensionCBs: ExtensionCallback<Base, Extension>[] | undefined =
    extensions.get(base);
  if (!extensionCBs) {
    throw new Error(
      'Base definition not found. Use `defclass` to create a definition.'
    );
  }
  extensionCBs.push(extension);
  return def as ExtensionDefinition<Base, Extension>;
}

/**
 * Use this generic type to extract the compiled class from a definition.
 * Extracting types can be useful when working with extended instances.
 * A good pattern is to create a type right after class definition or
 * extension.
 *
 * Example:
 * ```js
 * const NewClass = defclass(() => class NewClass {});
 * type NewClass = ExtractClass<typeof NewClass>;
 * // You can now use the above type to type an instance like so:
 * const newInstance: NewClass = NewClass.instantiate();
 * // But there is actually no need for explicit type because
 * // `instantiate` call returns with proper type.
 * ```
 */
type ExtractClass<T extends any> = T extends ExtensionDefinition<any, any>
  ? InstanceType<ReturnType<T['getCompiled']>>
  : never;

export { defclass, extend };
export type { ExtractClass };
