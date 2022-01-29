export abstract class InitializedBase {
  constructor(...args: unknown[]) {
    this.initialize(...args);
  }
  initialize(...args: unknown[]) {}
}

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

type ExtendedInterfaceConstructor<Spec extends ExtensionSpec> = GenericConstructor<
  Spec['BaseInterface'] & Spec['Extension']
>;

type GenericConstructor<T> = new (...args: unknown[]) => T;

export declare function defclass<I extends InitializedBase>(
  className: string,
  callback: () => InterfaceConstructor<I>
): void;

export declare function getclass<I extends InitializedBase>(
  className: string
): InterfaceConstructor<I>;

export declare function extend<Spec extends ExtensionSpec>(
  className: string,
  callback: (
    base: GenericConstructor<Spec['BaseInterface']>
  ) => ExtendedInterfaceConstructor<Spec>
): void;

// instantiate should call constructor.
export declare function instantiate<I extends InitializedBase>(
  className: string,
  ...args: Parameters<I['initialize']>
): I;

export declare function whenReady(callback: () => Promise<void>): void;
