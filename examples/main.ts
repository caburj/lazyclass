import { lazyclass } from '../lazyclass.ts';

const LazyMain = lazyclass(() => {
  class Main {
    message = '';
    constructor(message: string) {
      this.message = message;
    }
    run() {
      console.log(this.message);
    }
    async configure() {}
  }
  return Main;
});

LazyMain.extend((Main) => {
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
