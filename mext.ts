// deno-lint-ignore-file no-explicit-any
type Constructor<T> = new (...args: any[]) => T;
type Initialized<T> = { initialize(...args: any[]): T };
type BaseDefinition<B extends Initialized<any>> = {
  getCompiled(): Constructor<B>;
  instantiate(...args: Parameters<B['initialize']>): B;
  isInstance(obj: unknown): boolean;
  getBase(): Callback<B>;
};

type ExtensionDefinition<
  B extends Initialized<any>,
  T extends Initialized<any>
> = {
  getCompiled(): Constructor<T>;
  instantiate(...args: Parameters<T['initialize']>): T;
  isInstance(obj: unknown): boolean;
  getBase(): Callback<B>;
};

type Callback<T> = () => Constructor<T>;
type ExtensionCallback<B, T> = (base: Constructor<B>) => Constructor<T>;

const extensions: Map<
  Callback<any>,
  Array<ExtensionCallback<any, any>>
> = new Map();

export function defclass<B extends Initialized<any>>(
  callback: () => Constructor<B>
): BaseDefinition<B> {
  let compiled: Constructor<B> | undefined;
  const extensionCBs: Array<ExtensionCallback<any, B>> = [];
  extensions.set(callback, extensionCBs);
  return {
    getCompiled(): Constructor<B> {
      if (compiled) {
        return compiled;
      }
      compiled = extensionCBs.reduce((acc, cb) => cb(acc), callback());
      return compiled;
    },
    instantiate(...args: Parameters<B['initialize']>): B {
      const Class = this.getCompiled();
      const newInstance = new Class();
      newInstance.initialize(...args);
      return newInstance;
    },
    isInstance(obj: B) {
      const result = obj instanceof this.getCompiled();
      return result;
    },
    getBase() {
      return callback;
    },
  };
}

export function extend<
  B extends Initialized<any> = any,
  T extends Initialized<any> = any
>(def: BaseDefinition<B>, extension: Mixin<B, T>): ExtensionDefinition<B, T> {
  const base = def.getBase();
  const extensionCBs = extensions.get(base);
  if (!extensionCBs) {
    throw new Error(
      'Base definition not found. Use `defclass` for initial definition.'
    );
  }
  extensionCBs.push(extension);
  return def as unknown as ExtensionDefinition<B, T>;
}

type Mixin<B, X> = (base: Constructor<B>) => Constructor<X>;
type Compiled<T extends ExtensionDefinition<any, any>> = ReturnType<
  T['getCompiled']
>;

export type CompiledType<T extends any> = T extends ExtensionDefinition<
  any,
  any
>
  ? InstanceType<Compiled<T>>
  : T extends BaseDefinition<any>
  ? InstanceType<ReturnType<T['getCompiled']>>
  : never;
