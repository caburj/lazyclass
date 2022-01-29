import { MainDef } from "./core.ts";
import { whenReady } from './mext.ts';

whenReady(async () => {
  await import('./main.ext2.ts');
  const main = MainDef.instantiate('Hello World!');
  main.run();
});
