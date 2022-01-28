type WithInitialize<T, P extends any[] = []> = T extends { initialize: any }
  ? T
  : T & {
      initialize(...args: P): void;
    };

export type Define<T, InitializeParams extends any[] = []> = {
  Constructor: new (...args: any[]) => WithInitialize<T, InitializeParams>;
  Interface: WithInitialize<T, InitializeParams>;
};

export type Extension<B extends { Interface: any }, E> = Define<
  Interface<B> & E
> & {
  Base: B;
};

export type Interface<T extends { Interface: any }> = T['Interface'];
export type Constructor<T extends { Constructor: any }> = T['Constructor'];

export declare function define<T extends { Constructor: any }>(
  className: string,
  callback: () => Constructor<T>
): void;
export declare function getClass<T extends { Constructor: any }>(
  className: string
): Constructor<T>;
export declare function extend<
  E extends { Base: { Constructor: any }, Constructor: any }
>(className: string, callback: (base: Constructor<E['Base']>) => Constructor<E>): void;
// instantiate should call constructor.
export declare function instantiate<
  T extends { Constructor: any; Interface: any }
>(
  className: string,
  ...args: Parameters<Interface<T>['initialize']>
): Interface<T>;
export declare function whenReady(callback: () => Promise<void>): void;
