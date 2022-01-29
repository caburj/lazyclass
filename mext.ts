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

export function defclass<I extends InitializedBase>(
  callback: () => InterfaceConstructor<I>
): Definition<I> {
  let compiled: GenericConstructor<I> | undefined;
  extensions.set(callback, []);
  return {
    getCompiled(): GenericConstructor<I> {
      if (compiled) {
        return compiled;
      }
      compiled = extensions.get(callback)!.reduce((acc, cb) => cb(acc), callback());
      return compiled;
    },
    instantiate(...args: Parameters<I['initialize']>): I {
      const Class = compiled ? compiled : this.getCompiled();
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
  extensions.get(base)!.push(extensionCB);
  return def;
}
