declare global {
  interface Interfaces {}
}

export abstract class InitializedBase {
  constructor(...args: any[]) {
    this.initialize(...args);
  }
  initialize(...args: any[]) {}
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

type InterfaceConstructor<ClassName extends keyof Interfaces> = GenericConstructor<Interfaces[ClassName]>;

type ExtendedInterfaceConstructor<Spec extends ExtensionSpec> = GenericConstructor<
  Spec['BaseInterface'] & Spec['Extension']
>;

type GenericConstructor<T> = new (...args: any[]) => T;

export declare function define<K extends keyof Interfaces>(
  className: K,
  callback: () => InterfaceConstructor<K>
): void;

export declare function getClass<ClassName extends keyof Interfaces>(
  className: ClassName
): InterfaceConstructor<ClassName>;

export declare function extend<Spec extends ExtensionSpec>(
  className: keyof Interfaces,
  callback: (
    base: GenericConstructor<Spec['BaseInterface']>
  ) => ExtendedInterfaceConstructor<Spec>
): void;

// instantiate should call constructor.
export declare function instantiate<ClassName extends keyof Interfaces>(
  className: ClassName,
  ...args: Parameters<Interfaces[ClassName]['initialize']>
): Interfaces[ClassName];

export declare function whenReady(callback: () => Promise<void>): void;
