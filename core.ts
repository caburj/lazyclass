import { define, instantiate, getClass, Define, Interface } from './mext.ts';

export type MainDef = Define<
  {
    message: string;
    initialize(message: string): void;
    run(): void;
    configure(): Promise<void>;
  }
>;

define<MainDef>('Main', () => {
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

export type ProductDef = Define<
  {
    name: string;
    unitPrice: number;
    initialize(name: string, unitPrice: number): void;
  }
>;

define<ProductDef>('Product', () => {
  class Product {
    name = '';
    unitPrice = 0;
    initialize(name: string, unitPrice: number) {
      this.name = name;
      this.unitPrice = unitPrice;
    }
  }
  return Product;
});

export type OtherProductDef = Define<
  Interface<ProductDef> & {
    x: string;
    getX(): string;
  }
>;

define<OtherProductDef>('OtherProduct', () => {
  class OtherProduct extends getClass<ProductDef>('Product') {
    x = '';
    initialize() {}
    getX() {
      return this.x;
    }
  }
  return OtherProduct;
});

export type OrderlineDef = Define<
  {
    product: Interface<ProductDef>;
    quantity: number;
    initialize(product: Interface<ProductDef>, quantity: number): void;
    getTotal(): number;
  }
>;

define<OrderlineDef>('Orderline', () => {
  class Orderline {
    product!: Interface<ProductDef>;
    quantity = 0;
    initialize(product: Interface<ProductDef>, quantity: number) {
      this.product = product;
      this.quantity = quantity;
    }
    getTotal() {
      return this.product.unitPrice * this.quantity;
    }
  }
  return Orderline;
});

export type OrderDef = Define<{
  orderlines: Interface<OrderlineDef>[];
  initialize(): void;
  addProduct(product: Interface<ProductDef>): void;
  getTotal(): number;
}>;

define<OrderDef>('Order', () => {
  class Order {
    orderlines: Interface<OrderlineDef>[] = [];
    initialize() {}
    addProduct(product: Interface<ProductDef>) {
      let added = false;
      for (const line of this.orderlines) {
        if (line.product === product) {
          line.quantity += 1;
          added = true;
        }
      }
      if (!added) {
        const newLine = instantiate<OrderlineDef>('Orderline', product, 1);
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
