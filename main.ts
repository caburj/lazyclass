import { defclass, extend } from './lazyclass.ts';

const Main = defclass(() => {
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

extend(Main, (Main) => {
  return class MainExt extends Main {
    run() {
      super.run();
      console.log('This log is from an extension!');
    }
  };
});

window.onload = () => {
  const main = Main.instantiate('Hello World!');
  if (Main.isInstance(main)) {
    console.log('yeah, correct instance');
  }
  main.run();
};
