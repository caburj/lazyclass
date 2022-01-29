import { OrderlineExtDef1, OrderlineExtSpec1 } from './extension1.ts';
import { extend, ExtendedInterface, ExtensionSpec } from './mext.ts';

export type OrderlineExtSpec2 = ExtensionSpec<
  ExtendedInterface<OrderlineExtSpec1>,
  {
    getValidTaxes(): number[];
  }
>;

export const OrderlineExtDef2 = extend<OrderlineExtSpec2>(
  OrderlineExtDef1,
  (Orderline) => {
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
  }
);
