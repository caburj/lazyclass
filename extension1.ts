import type { Order, Orderline, Product } from './core.ts';
import { extend, ExtensionSpec } from './mext.ts';

export type OrderExtSpec1 = ExtensionSpec<
  Order,
  {
    checkBeforeAdd(product: Product): boolean;
  }
>;

extend<OrderExtSpec1>('Order', (Order) => {
  class ExtendedOrder1 extends Order {
    checkBeforeAdd(product: Product) {
      return product.name !== 'xxx';
    }
    addProduct(product: Product) {
      if (this.checkBeforeAdd(product)) {
        super.addProduct(product);
      }
    }
  }
  return ExtendedOrder1;
});

export type OrderlineExtSpec1 = ExtensionSpec<
  Orderline,
  {
    taxes: number[];
    setTaxes(taxes: number[]): void;
    getTaxes(): number[];
  }
>;

extend<OrderlineExtSpec1>('Orderline', (Orderline) => {
  class ExtendedOrderline1 extends Orderline {
    taxes: number[] = [];
    setTaxes(taxes: number[]) {
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
