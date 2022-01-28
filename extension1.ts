import type { OrderDef, OrderlineDef, ProductDef } from './core.ts';
import { extend, Interface, Extension } from './mext.ts';

export type OrderExt1 = Extension<
  OrderDef,
  {
    checkBeforeAdd(product: Interface<ProductDef>): boolean;
  }
>;

extend<OrderExt1>('Order', (Order) => {
  class ExtendedOrder1 extends Order {
    checkBeforeAdd(product: Interface<ProductDef>) {
      return product.name !== 'xxx';
    }
    addProduct(product: Interface<ProductDef>) {
      if (this.checkBeforeAdd(product)) {
        super.addProduct(product);
      }
    }
  }
  return ExtendedOrder1;
});

export type OrderlineExt1 = Extension<
  OrderlineDef,
  {
    taxes: number[];
    getTaxes(): number[];
  }
>;

extend<OrderlineExt1>('Orderline', (Orderline) => {
  class ExtendedOrderline1 extends Orderline {
    taxes: number[] = [];
    constructor(
      product: Interface<ProductDef>,
      quantity: number,
      taxes: number[]
    ) {
      super(product, quantity);
      this.taxes.push(...taxes);
    }
    getTaxes() {
      return this.taxes;
    }
    getTotal() {
      const totalTax = this.getTaxes().reduce((acc, tax) => acc + tax, 0);
      return super.getTotal() * (totalTax / 100 + 1);
    }
  }
  return ExtendedOrderline1;
});
