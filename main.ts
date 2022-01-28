import { MainDef } from './core.ts';
import { instantiate, whenReady } from './mext.ts';

whenReady(async () => {
  const main = instantiate<MainDef>('Main', 'Hello World!');
  const configure = main.configure();
  await configure;
  main.run();
});
