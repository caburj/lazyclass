import { assertEquals } from 'https://deno.land/std@0.122.0/testing/asserts.ts';
import { defclass, extend, ExtractClass } from './mext.ts';

Deno.test({
  name: 'simple class',
  fn() {
    let x = 0;
    const Main = defclass(() => {
      return class Main {
        initialize(num: number) {
          x += num;
        }
        plusTwo() {
          x += 2;
        }
      };
    });
    const main = Main.instantiate(1);
    assertEquals(x, 1);
    main.plusTwo();
    assertEquals(x, 3);
  },
});

Deno.test({
  name: 'extend method',
  fn() {
    const Main = defclass(() => {
      class Main {
        num = 0;
        initialize(start: number) {
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

    const ExtMain = extend(Main, (Main) => {
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

    const NotReallyMain = defclass(() => {
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

    const main = ExtMain.instantiate(0);
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
    const Product = defclass(() => {
      return class Product {
        name = '';
        unitPrice = 0;
        initialize(name: string, unitPrice: number) {
          this.name = name;
          this.unitPrice = unitPrice;
        }
        getUnitPrice() {
          return this.unitPrice;
        }
      };
    });

    const Orderline = defclass(() => {
      return class Orderline {
        product!: ExtractClass<typeof Product>;
        quantity = 0;
        initialize(product: ExtractClass<typeof Product>, quantity = 1) {
          this.product = product;
          this.quantity = quantity;
        }
        getPrice() {
          return this.quantity * this.product.getUnitPrice();
        }
      };
    });

    const XProduct = extend(Product, (Product) => {
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
    type XProduct = ExtractClass<typeof XProduct>;

    extend(Orderline, (Orderline) => {
      return class XOrderline extends Orderline {
        initialize(product: XProduct, quantity: number) {
          super.initialize(product, quantity);
          (this.product as XProduct).setExtraPrice(0.5);
        }
      };
    });

    function app() {
      const p1 = Product.instantiate('water', 1);
      const p2 = Product.instantiate('burger', 2);
      const l1 = Orderline.instantiate(p1, 1);
      const l2 = Orderline.instantiate(p2, 2);

      assertEquals(l1.getPrice(), 1.5);
      assertEquals(l2.getPrice(), 5);
    }

    app();
  },
});
