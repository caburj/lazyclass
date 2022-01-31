import { assertEquals } from 'https://deno.land/std@0.122.0/testing/asserts.ts';
import { lazyclass, ExtractClass } from './lazyclass.ts';

Deno.test({
  name: 'simple class',
  fn() {
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
  fn() {
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
    assertEquals(NotReallyMain.isInstance(notMain), true);
    notMain.foo();
    assertEquals(notMain.num, 104);
  },
});

Deno.test({
  name: 'return other extended type',
  fn() {
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
    type Product = ExtractClass<typeof LazyProduct>;

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
    type XProduct = ExtractClass<typeof LazyXProduct>;

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
