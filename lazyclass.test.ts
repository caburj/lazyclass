import { assertEquals } from 'https://deno.land/std@0.122.0/testing/asserts.ts';
import lazyclass, { UnwrapType } from './lazyclass.ts';

Deno.test({
  name: 'simple class',
  fn: () => {
    let x = 0;
    const LazyMain = lazyclass(() => {
      return class Main {
        constructor(num: number) {
          x += num;
        }
        plusTwo() {
          x += 2;
        }
      };
    });
    const main = LazyMain.instantiate(1);
    assertEquals(x, 1);
    main.plusTwo();
    assertEquals(x, 3);
  },
});

Deno.test({
  name: 'extend method',
  fn: () => {
    const LazyMain = lazyclass(() => {
      class Main {
        num = 0;
        constructor(start: number) {
          this.num = start;
        }
        increment(by: number) {
          this.num += by;
          return this;
        }
        decrement(by: number) {
          this.num -= by;
          return this;
        }
      }
      return Main;
    });

    const ExtMain = LazyMain.extend((Main) => {
      class ExtMain extends Main {
        double() {
          this.num *= 2;
          return this;
        }
        increment(by: number) {
          super.increment(by);
          this.num += 1;
          return this;
        }
      }
      return ExtMain;
    });

    const NotReallyMain = lazyclass(() => {
      return class NotReallyMain extends ExtMain.getCompiled() {
        double() {
          super.double();
          this.num *= 2;
          return this;
        }
        foo() {
          this.num += 100;
          return this;
        }
      };
    });

    const main = LazyMain.instantiate(0);
    assertEquals(main.num, 0);
    main.increment(1);
    assertEquals(main.num, 2);
    main.increment(1);

    const notMain = NotReallyMain.instantiate(1);
    assertEquals(notMain.num, 1);
    notMain.double();
    assertEquals(notMain.num, 4);
    assertEquals(NotReallyMain.hasInstance(notMain), true);
    notMain.foo();
    assertEquals(notMain.num, 104);
  },
});

Deno.test({
  name: 'return other extended type',
  fn: () => {
    // Base definitions module
    const LazyProduct = lazyclass(() => {
      return class Product {
        name = '';
        unitPrice = 0;
        constructor(name: string, unitPrice: number) {
          this.name = name;
          this.unitPrice = unitPrice;
        }
        getUnitPrice() {
          return this.unitPrice;
        }
      };
    });
    type Product = UnwrapType<typeof LazyProduct>;

    const LazyOrderline = lazyclass(() => {
      return class Orderline {
        product!: Product;
        quantity = 0;
        constructor(product: Product, quantity = 1) {
          this.product = product;
          this.quantity = quantity;
        }
        getPrice() {
          return this.quantity * this.product.getUnitPrice();
        }
      };
    });

    // Extensions module
    const LazyXProduct = LazyProduct.extend((Product) => {
      return class XProduct extends Product {
        extraPrice = 0;
        setExtraPrice(val: number) {
          this.extraPrice = val;
        }
        getUnitPrice() {
          return super.getUnitPrice() + this.extraPrice;
        }
      };
    });
    type XProduct = UnwrapType<typeof LazyXProduct>;

    LazyOrderline.extend((Orderline) => {
      return class XOrderline extends Orderline {
        constructor(product: XProduct, quantity: number) {
          super(product, quantity);
          // NOTE: We are casting the product field to be XProduct
          // because we are aware of the extension in this module.
          // We know exactly that the type of Orderline.product is
          // extended so this is legal. In fact, this is the way to
          // really allow typed extensions.
          (this.product as XProduct).setExtraPrice(0.5);
        }
      };
    });

    // Program
    function app() {
      const p1 = LazyProduct.instantiate('water', 1);
      const p2 = LazyProduct.instantiate('burger', 2);
      const l1 = LazyOrderline.instantiate(p1, 1);
      const l2 = LazyOrderline.instantiate(p2, 2);

      assertEquals(l1.getPrice(), 1.5);
      assertEquals(l2.getPrice(), 5);
    }

    app();
  },
});

Deno.test({
  name: 'extend based on two extensions',
  fn: () => {
    let x = 1;

    const LazyFoo = lazyclass(
      () =>
        class Foo {
          constructor(public value: number) {}
          foo() {
            x += this.value;
          }
        }
    );

    const LazyFooE1 = LazyFoo.extend(
      (Foo) =>
        class FooE1 extends Foo {
          foo1() {
            x += this.value + 1;
          }
        }
    );

    const LazyFooE2 = LazyFoo.extend(
      (Foo) =>
        class FooE2 extends Foo {
          foo2() {
            x += this.value + 2;
          }
        }
    );

    const LazyFooE3 = LazyFooE1.with(LazyFooE2).extend((Foo) => {
      return class FooE3 extends Foo {
        foo3() {
          x += this.value + 3;
        }
      };
    });

    LazyFoo.instantiate(1).foo();
    assertEquals(x, 2);

    LazyFooE1.instantiate(1).foo();
    assertEquals(x, 3);
    LazyFooE1.instantiate(2).foo1();
    assertEquals(x, 6);

    LazyFooE2.instantiate(3).foo();
    assertEquals(x, 9);
    LazyFooE2.instantiate(4).foo2();
    assertEquals(x, 15);

    LazyFooE3.instantiate(5).foo();
    assertEquals(x, 20);
    LazyFooE3.instantiate(6).foo1();
    assertEquals(x, 27);
    LazyFooE3.instantiate(7).foo2();
    assertEquals(x, 36);
    LazyFooE3.instantiate(8).foo3();
    assertEquals(x, 47);
  },
});

Deno.test({
  name: 'extend based on multiple definitions',
  fn: () => {
    const LazyCore = lazyclass(
      () =>
        class Core {
          constructor(public value: number) {}
          foo() {
            return this.value;
          }
        }
    );

    const LazyCore1 = LazyCore.extend(
      (Core) =>
        class Core1 extends Core {
          foo() {
            return super.foo() + 1;
          }
        }
    );

    const LazyCore2 = LazyCore.extend(
      (Core) =>
        class Core2 extends Core {
          foo() {
            return super.foo() * 2;
          }
        }
    );

    const LazyCore3 = LazyCore.extend(
      (Core) =>
        class Core3 extends Core {
          foo() {
            return super.foo() - 3;
          }
        }
    );

    const LazyCore4 = LazyCore1.with(LazyCore2).extend(
      (Core) =>
        class Core4 extends Core {
          foo() {
            return super.foo() + 4;
          }
        }
    );

    const LazyCore5 = LazyCore3.extend(
      (Core3) =>
        class Core5 extends Core3 {
          foo() {
            return super.foo() * 5;
          }
        }
    );

    const LazyCore6 = LazyCore3.extend(
      (Core3) =>
        class Core6 extends Core3 {
          foo() {
            return super.foo() - 6;
          }
        }
    );

    const LazyCore7 = LazyCore4.with(LazyCore5)
      .with(LazyCore6)
      .extend(
        (Core) =>
          class Core7 extends Core {
            foo() {
              return super.foo() + 7;
            }
          }
      );

    assertEquals(LazyCore7.instantiate(1).foo(), 26);
  },
});
