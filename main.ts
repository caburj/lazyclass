import { MainDef } from "./core.ts";
import { whenReady } from './mext.ts';

whenReady(async () => {
  await import('./main.ext2.ts');
  const main = MainDef.instantiate('Hello World!');
  if (MainDef.isInstance(main)) {
    console.log('yeah, correct instance');
  }
  main.run();
});
