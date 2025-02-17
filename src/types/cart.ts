/**
 * File: types/cart.ts
 * Description: This file contains all the types for the data involved with cart 
*/

import { type ProductType } from './product';

interface CartProduct {
  _id: string,
  productId: ProductType,
  groupId: string,
  quantity: number,
};

interface CartType {
  _id: string,
  userId: string,
  products: CartProduct[],
};

type CartProductWithPrice = CartProduct & {
  price?: number,
};

export {
  type CartProduct,
  type CartType,
  type CartProductWithPrice,
};
