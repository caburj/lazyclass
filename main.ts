import { MainDef } from './core.ts';

window.onload = async () => {
  await import('./main.ext2.ts');
  const main = MainDef.instantiate('Hello World!');
  if (MainDef.isInstance(main)) {
    console.log('yeah, correct instance');
  }
  main.run();
};
