# INTRODUCTION

Make extensible apps with lazy classes.

Concept based on Odoo ORM framework. It introduces a very extensible feature, such that
models are extended in-place with customized python class inheritance.

# Usage

## Declare lazy class

```js
// file: class-definitions.ts
import lazyclass, { ExtractClass } from 'lazyclass.ts'

export const LazyProduct = lazyclass(() => {
    return class Product {
        constructor(public name: string, public unitPrice: number) {}
        getUnitPrice() {
            return this.unitPrice;
        }
    }
});

// Unwrap the lazy class to get the type of its instances.
export type Product = ExtractClass<typeof LazyProduct>;

export const LazyOrderItem = lazyclass(() => {
    return class OrderItem {
        constructor(public product: Product, public quantity: number) {}
        getTotal() {
            return this.quantity * this.product.getUnitPrice();
        }
    }
});
export type OrderItem = ExtractClass<typeof LazyOrderItem>;

export const LazyOrder = lazyclass(() => {
    return class Order {
        constructor(id: string) {
            this.id = id;
            this.orderItems: OrderItem[] = [];
        }
        addProduct(product: Product) {
            const existingItem = this.orderItems.find(item => item.product === product);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.orderItems.push(LazyOrderItem.instantiate(product, 1));
            }
        }
        getTotal() {
            return this.orderItems.reduce((total, item) => total + item.getTotal(), 0);
        }
    }
})

// file: main.ts
import { LazyProduct, LazyOrder } from 'class-definitions.ts'

function app() {
    const burger = LazyProduct.instantiate('Burger', 5);
    const water = LazyProduct.instantiate('Water', 2.5);
    const order = LazyOrder.instantiate('order-001');
    order.addProduct(burger);
    console.log('order total: ', order.getTotal());
    order.addProduct(burger);
    console.log('order total: ', order.getTotal());
    order.addProduct(water);
    console.log('order total: ', order.getTotal());
}

if (import.meta.main) {
    // Instantiate the lazy class outside the declaration
    // scope. Important to take advantage of the real use
    // of defining lazy classes.
    window.onload = () => app();
}
```

Running `main.ts` will log:
```
order total: 5
order total: 10
order total: 12.5
```

## Extend (in-place) lazy class

```js
// file: extension.ts

// Import the lazy class, it has the `extend` method.
import { LazyProduct } from 'class-definitions.ts';

// Let's say we want to set extra price of 1.0 on burgers.
export const LazyProductExt = LazyProduct.extend((Product) => {
    return class ProductExt extends Product {
        getUnitPrice() {
            const originalUnitPrice = super.getUnitPrice();
            if (this.name == 'Burger') {
                return originalUnitPrice + 1.0;
            }
            return originalUnitPrice;
        }
    }
});
```

Loading (importing) `extension.ts` in the `main.ts` will modify how
original app works. The class `Product` is practically replaced by the
extended definition made here.

When `main.ts` is run, it will now log:
```
order total: 6
order total: 12
order total: 14.5
```
because of the additional price in each burger order item.

## Lazy subclassing

Deriving new class based on other lazy class can also be done.

```js
// file: another-app.ts
import lazyclass from 'lazyclass.ts';
import { LazyOrder, LazyProduct } from 'class-definitions.ts';

const LazyDiscountedOrder = lazyclass(() => {
    return class OrderNew extends LazyOrder.getCompiled() {
        discount = 0;
        setDiscount(value: number) {
            this.discount = discount;
        }
        getTotal() {
            return (1 - this.discount / 100) * super.getTotal();
        }
    }
})

function app() {
    const burger = LazyProduct.instantiate('Burger', 5);
    const water = LazyProduct.instantiate('Water', 2.5);
    const order = LazyDiscountedOrder.instantiate('new-order-001');

    // set discount here
    order.setDiscount(50);

    order.addProduct(burger);
    console.log('order total: ', order.getTotal());
    order.addProduct(burger);
    console.log('order total: ', order.getTotal());
    order.addProduct(water);
    console.log('order total: ', order.getTotal());
}

if (import.meta.main) {
    window.onload = () => app();
}
```

Because of 50% discount, running `another-app.ts` will log:
```
order total: 2.5
order total: 5
order total: 6.25
```
