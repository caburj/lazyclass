export type Define<T extends { initialize(...args: any[]): void }> = {
  constructor: new (...args: any[]) => T;
  interface: T;
};

export type Extension<B extends { interface: any }, E> = Define<
  Interface<B> & E
> & {
  base: B;
};

export type Interface<T extends { interface: any }> = T['interface'];
export type Constructor<T extends { constructor: any }> = T['constructor'];

export declare function define<T extends { constructor: any }>(
  className: string,
  callback: () => Constructor<T>
): void;
export declare function getClass<T extends { constructor: any }>(
  className: string
): Constructor<T>;
export declare function extend<
  E extends { base: { constructor: any }; constructor: any }
>(
  className: string,
  callback: (base: Constructor<E['base']>) => Constructor<E>
): void;
// instantiate should call constructor.
export declare function instantiate<
  T extends { constructor: any; interface: any }
>(
  className: string,
  ...args: Parameters<Interface<T>['initialize']>
): Interface<T>;
export declare function whenReady(callback: () => Promise<void>): void;
