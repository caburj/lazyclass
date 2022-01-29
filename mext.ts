export abstract class InitializedBase {
  constructor(...args: unknown[]) {
    this.initialize(...args);
  }
  initialize(..._args: unknown[]) {}
}

type Definition<T extends InitializedBase> = {
  getCompiled(): GenericConstructor<T>;
  instantiate(...args: Parameters<T['initialize']>): T;
  getBase(): () => GenericConstructor<T>;
  isInstance(obj: any): boolean;
};

export type ExtensionSpec<
  BaseInterface extends InitializedBase = any,
  Extension extends Record<never, never> = any
> = {
  BaseInterface: BaseInterface;
  Extension: Extension;
};

export type ExtendedInterface<Spec extends ExtensionSpec> =
  Spec['BaseInterface'] & Spec['Extension'];

type InterfaceConstructor<I extends InitializedBase> = GenericConstructor<I>;

type ExtendedInterfaceConstructor<Spec extends ExtensionSpec> =
  GenericConstructor<Spec['BaseInterface'] & Spec['Extension']>;

type GenericConstructor<T> = new (...args: unknown[]) => T;
type Constructor = new (...args: unknown[]) => any;

const extensions: Map<
  () => Constructor,
  Array<(base: Constructor) => Constructor>
> = new Map();

// How about an oversion that allows normal class as base?
// But this will make the code more complicated and will
// introduce more ways on declaring a class. This module is
// already opinionated, let's stay opinionated and only allow
// one way of declaring a class definition.
export function defclass<I extends InitializedBase>(
  callback: () => InterfaceConstructor<I>
): Definition<I> {
  let compiled: GenericConstructor<I> | undefined;
  const extensionCBs: Array<(base: Constructor) => Constructor> = [];
  extensions.set(callback, extensionCBs);
  return {
    getCompiled(): GenericConstructor<I> {
      if (compiled) {
        return compiled;
      }
      compiled = extensionCBs.reduce((acc, cb) => cb(acc), callback());
      return compiled;
    },
    instantiate(...args: Parameters<I['initialize']>): I {
      const Class = this.getCompiled();
      const newInstance = new Class();
      newInstance.initialize(...args);
      return newInstance;
    },
    getBase() {
      return callback;
    },
    isInstance(obj: I) {
      const result = obj instanceof this.getCompiled();
      return result;
    },
  };
}

export function extend<Spec extends ExtensionSpec>(
  def: Definition<Spec['BaseInterface']>,
  extensionCB: (
    base: GenericConstructor<Spec['BaseInterface']>
  ) => ExtendedInterfaceConstructor<Spec>
): Definition<ExtendedInterface<Spec>> {
  const base = def.getBase();
  const extensionCBs = extensions.get(base);
  if (!extensionCBs) {
    throw new Error(
      'Base definition not found. Use `defclass` for initial definition.'
    );
  }
  extensionCBs.push(extensionCB);
  return def;
}
