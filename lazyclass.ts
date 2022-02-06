// deno-lint-ignore-file no-explicit-any

/**
 * Export this to allow easy definitions of mixins.
 *
 * E.g.
 * ```
 * function Mixin<B extends Constructor<{ value: number }>(base: B) {
 *   return class Mixin extends base {
 *     mixin() {
 *       this.value += 100;
 *     }
 *   }
 * }
 *
 * class X {
 *   constructor(public value: number) {}
 * }
 *
 * class Y extends Mixin(X) {
 *   y() {
 *     this.mixin();
 *     return this.value;
 *   }
 * }
 * ```
 */
export type Constructor<T = any> = {
  new (...args: any[]): T;
  prototype: T;
};

/**
 * Provide a constructor to generate a reconstructed version of the constructor.
 * Important in defining mixins used for in-place inheritance.
 */
type ReConstructor<C extends Constructor> = {
  // It's important to have this args as any[]. Using ConstructorParameters<B> won't work.
  // The return type won't be the intersection. I don't know why.
  new (...args: any[]): InstanceType<C>;
  prototype: InstanceType<C>;
};
type Base<T> = () => T;
type Mixin<B extends Constructor, E extends Constructor> = (base: B) => ReConstructor<B> & E;
type Mixed<B extends Constructor, E extends Constructor> = ReturnType<Mixin<B, E>>;
type ExtensionDefinition<B extends Constructor, E extends Constructor> = {
  getCompiled(): E;
  instantiate(...args: ConstructorParameters<E>): InstanceType<E>;
  hasInstance<T>(obj: T): boolean;
  getBase(): Base<B>;
  extend<X extends Constructor>(mixin: Mixin<E, X>): ExtensionDefinition<B, Mixed<E, X>>;
  with<X extends B>(def: ExtensionDefinition<B, X>): ExtensionDefinition<B, Mixed<E, X>>;
};
type BaseDefinition<B extends Constructor> = ExtensionDefinition<B, B>;

const extensions: Map<Base<any>, Mixin<any, any>[]> = new Map();

export default function lazyclass<B extends Constructor>(base: Base<B>): BaseDefinition<B> {
  let compiled: B | undefined;
  const extensionCBs: Mixin<B, any>[] = [];
  extensions.set(base, extensionCBs);
  return {
    getCompiled() {
      if (compiled) {
        return compiled;
      }
      compiled = extensionCBs.reduce((acc, cb) => cb(acc), base());
      return compiled;
    },
    instantiate(...args) {
      const Class = this.getCompiled();
      const newInstance = new Class(...args);
      return newInstance;
    },
    hasInstance<T>(obj: T) {
      return obj instanceof this.getCompiled();
    },
    getBase() {
      return base;
    },
    extend<E extends Constructor>(extension: Mixin<B, E>): ExtensionDefinition<B, E> {
      extensionCBs.push(extension);
      // TODO: Can we do better than this?
      return this as unknown as ExtensionDefinition<B, E>;
    },
    with<E extends B>(def: ExtensionDefinition<B, E>): ExtensionDefinition<B, E> {
      if (this.getBase() !== def.getBase()) {
        throw new Error('Cannot mix, incompatible bases.');
      }
      return this as ExtensionDefinition<B, E>;
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
 * const LazyClass = lazyclass(() => class NewClass {});
 * type NewClass = UnwrapType<typeof LazyClass>;
 * // You can now use the above type to type an instance like so:
 * const newInstance: NewClass = LazyClass.instantiate();
 * // But there is actually no need for explicit type because
 * // `instantiate` call returns with proper type.
 * ```
 */
export type UnwrapType<
  T extends ExtensionDefinition<B, X>,
  B extends Constructor = any,
  X extends Constructor = any
> = InstanceType<ReturnType<T['getCompiled']>>;
