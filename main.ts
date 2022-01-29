import { instantiate, whenReady } from './mext.ts';

whenReady(async () => {
  const main = instantiate('Main', 'Hello World!');
  const configure = main.configure();
  await configure;
  main.run();
});
