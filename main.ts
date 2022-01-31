import { lazyclass, extend } from './lazyclass.ts';

const LazyMain = lazyclass(() => {
  class Main {
    message = '';
    initialize(message: string) {
      this.message = message;
    }
    run() {
      console.log(this.message);
    }
    async configure() {}
  }
  return Main;
});

extend(LazyMain, (Main) => {
  return class MainExt extends Main {
    run() {
      super.run();
      console.log('This log is from an extension!');
    }
  };
});

window.onload = () => {
  const main = LazyMain.instantiate('Hello World!');
  if (LazyMain.isInstance(main)) {
    console.log('yeah, correct instance');
  }
  main.run();
};
