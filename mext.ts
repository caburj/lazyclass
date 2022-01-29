export abstract class InitializedBase {
  constructor(...args: unknown[]) {
    this.initialize(...args);
  }
  initialize(...args: unknown[]) {}
}

type Definition<T extends InitializedBase> = {
  getcompiled(): GenericConstructor<T>;
  instantiate(...args: Parameters<T['initialize']>): T;
  getBase(): () => GenericConstructor<T>;
};

export type ExtensionSpec<
  BaseInterface extends unknown = unknown,
  Extension extends unknown = unknown
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
    getcompiled(): GenericConstructor<I> {
      if (compiled) {
        return compiled;
      }
      return extensions.get(callback)!.reduce((acc, cb) => cb(acc), callback());
    },
    instantiate(...args: Parameters<I['initialize']>): I {
      const Class = compiled ? compiled : this.getcompiled();
      const newInstance = new Class();
      newInstance.initialize(...args);
      return newInstance;
    },
    getBase() {
      return callback;
    },
  };
}

export declare function extend<Spec extends ExtensionSpec>(
  className: string,
  callback: (
    base: GenericConstructor<Spec['BaseInterface']>
  ) => ExtendedInterfaceConstructor<Spec>
): void;

export function whenReady(callback: () => Promise<void>): void {
  window.onload = async () => {
    await callback();
  };
}
