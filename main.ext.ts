import { extend, ExtensionSpec } from './mext.ts';
import { MainDef, Main } from './core.ts';

export type MainExtSpec1 = ExtensionSpec<
  Main,
  {
    runExtension(): void;
  }
>;

export const MainExtDef1 = extend<MainExtSpec1>(MainDef, (base) => {
  class MainExt1 extends base {
    run() {
      super.run();
      this.runExtension();
    }
    runExtension() {
      console.log('hello again!');
    }
  }
  return MainExt1;
});
