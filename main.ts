import { MainDef } from "./core.ts";
import { whenReady } from './mext.ts';

whenReady(async () => {
  const main = MainDef.instantiate('Hello World!');
  const configure = main.configure();
  await configure;
  main.run();
});
