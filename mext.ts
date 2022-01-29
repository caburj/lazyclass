export abstract class InitializedBase {
  constructor(...args: unknown[]) {
    this.initialize(...args);
  }
  initialize(...args: unknown[]) {}
}

type ClassDefinition<T extends InitializedBase> = {
  getcompiled(): Constructor<T>;
  instantiate(...args: Parameters<T['initialize']>): T;
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

type InterfaceConstructor<I extends InitializedBase> = Constructor<I>;

type ExtendedInterfaceConstructor<Spec extends ExtensionSpec> =
  Constructor<Spec['BaseInterface'] & Spec['Extension']>;

type Constructor<T> = new (...args: unknown[]) => T;

export declare function defclass<I extends InitializedBase>(
  callback: () => InterfaceConstructor<I>
): ClassDefinition<I>;

export declare function extend<Spec extends ExtensionSpec>(
  className: string,
  callback: (
    base: Constructor<Spec['BaseInterface']>
  ) => ExtendedInterfaceConstructor<Spec>
): void;

export declare function whenReady(callback: () => Promise<void>): void;
