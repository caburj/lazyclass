// deno-lint-ignore-file no-explicit-any
type BasicConstructor = new (...args: any[]) => any;

type Definition<T extends BasicConstructor> = {
  getCompiled(): T;
  instantiate(...args: ConstructorParameters<T>): InstanceType<T>;
  hasInstance<X>(obj: X): boolean;
  getBase(): BaseCallback<T>;
  extend<E extends T>(extensionCB: ExtensionCallback<T, E>): Definition<E>;
  extendWith<X extends BasicConstructor, E extends T>(
    otherDef: Definition<X>,
    extensionCB: ExtensionCallback<Mixed<T, X>, E>
  ): Definition<Mixed<Mixed<T, X>, E>>;
};
type BaseCallback<T> = () => T;

type ExtensionCallback<
  B extends BasicConstructor,
  E extends BasicConstructor
> = (base: B) => {
  // It's important to have this args as any[]. Using ConstructorParameters<B> won't work.
  // The return type won't be the intersection. I don't know why.
  new (...args: any[]): InstanceType<B>;
  prototype: InstanceType<B>;
} & E;

type Mixed<B extends BasicConstructor, E extends BasicConstructor> = ReturnType<
  ExtensionCallback<B, E>
>;

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
function lazyclass<B extends BasicConstructor>(
  callback: BaseCallback<B>
): Definition<B> {
  let compiled: B | undefined;
  const extensionCBs: ExtensionCallback<B, any>[] = [];
  extensions.set(callback, extensionCBs);
  return {
    getCompiled(): B {
      if (compiled) {
        return compiled;
      }
      compiled = extensionCBs.reduce((acc, cb) => cb(acc), callback());
      return compiled;
    },
    instantiate(...args: ConstructorParameters<B>): InstanceType<B> {
      const Class = this.getCompiled();
      const newInstance = new Class(...args);
      return newInstance;
    },
    hasInstance<T>(obj: T) {
      return obj instanceof this.getCompiled();
    },
    getBase() {
      return callback;
    },
    extend<E extends B>(extension: ExtensionCallback<B, E>): Definition<E> {
      extensionCBs.push(extension);
      return this as Definition<E>;
    },
    extendWith<O extends BasicConstructor, E extends B>(
      otherDef: Definition<O>,
      extensionCB: ExtensionCallback<Mixed<B, O>, E>
    ): Definition<Mixed<Mixed<B, O>, E>> {
      if (this.getBase() !== (otherDef.getBase() as any)) {
        throw new Error(
          'Base should be the same when extending with other definitions.'
        );
      }
      extensionCBs.push(extensionCB as any);
      return this as Definition<Mixed<Mixed<B, O>, E>>;
    },
  };
}

/**
 * Use this generic type to extract the compiled class from a definition.
 * Extracting types can be useful when working with extended instances.
 * A good pattern is to create a type right after class definition or
 * extension.
 *
 * Example:
 * ```js
 * const NewClass = lazyclass(() => class NewClass {});
 * type NewClass = ExtractClass<typeof NewClass>;
 * // You can now use the above type to type an instance like so:
 * const newInstance: NewClass = NewClass.instantiate();
 * // But there is actually no need for explicit type because
 * // `instantiate` call returns with proper type.
 * ```
 */
type ExtractClass<T extends any> = T extends Definition<any>
  ? InstanceType<ReturnType<T['getCompiled']>>
  : never;

export default lazyclass;
export type { ExtractClass };
