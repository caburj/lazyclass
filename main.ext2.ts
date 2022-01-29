import { extend, ExtendedInterface, ExtensionSpec } from './mext.ts';
import { MainExtDef1, MainExtSpec1 } from './main.ext.ts';

type MainExtSpec2 = ExtensionSpec<
  ExtendedInterface<MainExtSpec1>,
  {
    runExtension2(): void;
  }
>;

export const MainExtDef2 = extend<MainExtSpec2>(MainExtDef1, (base) => {
  class MainExt1 extends base {
    runExtension() {
      super.runExtension();
      this.runExtension2();
    }
    runExtension2() {
      console.log('hello hello');
    }
  }
  return MainExt1;
});
