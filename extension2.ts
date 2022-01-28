import { OrderlineExt1 } from './extension1.ts';
import { Extension, extend } from './mext.ts';

export type OrderlineExt2 = Extension<
  OrderlineExt1,
  {
    getValidTaxes(): number[];
  }
>;

extend<OrderlineExt2>('Orderline', (Orderline) => {
  class ExtendedOrderline2 extends Orderline {
    getValidTaxes() {
      const validTaxes = [];
      for (const tax of this.taxes) {
        if (tax <= 100) {
          validTaxes.push(tax);
        }
      }
      return validTaxes;
    }
    getTaxes() {
      return this.getValidTaxes();
    }
  }
  return ExtendedOrderline2;
});
