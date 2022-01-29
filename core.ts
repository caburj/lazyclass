import { define, instantiate, getClass, InitializedBase } from './mext.ts';

declare global {
  interface Interfaces {
    Main: Main;
    Product: Product;
    OtherProduct: OtherProduct;
    Orderline: Orderline;
    Order: Order;
  }
}

export type Main = {
  message: string;
  initialize(message: string): void;
  run(): void;
  configure(): Promise<void>;
};

define('Main', () => {
  class Main extends InitializedBase {
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

export type Product = {
  name: string;
  unitPrice: number;
  initialize(name: string, unitPrice: number): void;
};

define('Product', () => {
  class Product extends InitializedBase {
    name = '';
    unitPrice = 0;
    initialize(name: string, unitPrice: number) {
      this.name = name;
      this.unitPrice = unitPrice;
    }
  }
  return Product;
});

export type OtherProduct = Product & {
  x: string;
  getX(): string;
};

define('OtherProduct', () => {
  class OtherProduct extends getClass('Product') {
    x = '';
    getX() {
      return this.x;
    }
  }
  return OtherProduct;
});

export type Orderline = {
  product: Product;
  quantity: number;
  initialize(product: Product, quantity: number): void;
  getTotal(): number;
};

define('Orderline', () => {
  class Orderline extends InitializedBase {
    product!: Product;
    quantity = 0;
    initialize(product: Product, quantity: number) {
      this.product = product;
      this.quantity = quantity;
    }
    getTotal() {
      return this.product.unitPrice * this.quantity;
    }
  }
  return Orderline;
});

export type Order = {
  orderlines: Orderline[];
  initialize(): void;
  addProduct(product: Product): void;
  getTotal(): number;
};

define('Order', () => {
  class Order extends InitializedBase {
    orderlines: Orderline[] = [];
    addProduct(product: Product) {
      let added = false;
      for (const line of this.orderlines) {
        if (line.product === product) {
          line.quantity += 1;
          added = true;
        }
      }
      if (!added) {
        const newLine = instantiate('Orderline', product, 1);
        this.orderlines.push(newLine);
      }
    }
    getTotal() {
      let total = 0;
      for (const line of this.orderlines) {
        total += line.getTotal();
      }
      return total;
    }
  }
  return Order;
});
