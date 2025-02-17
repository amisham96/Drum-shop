/**
 * File: cartWrapper.tsx
 * Description: This file just contains the component to wrap around the 
 *  cart client page, and to just add the initial state to the context.
*/

'use client';

import { CartContextProvider } from '../../../context/cart/provider';
import { reducer } from '../../../context/cart/reducer';
import { CartProductWithPrice, CartType } from '../../../../types/cart';
import CartPage from '../cart';

function CartWrapper(
  { cart }: { cart: (CartType | null) }
) {
  // calculate initial state and then set the value
  let products: CartProductWithPrice[] = [];

  if (cart) {
    cart.products.forEach((cartProduct) => {
      const product = cartProduct.productId;
      let price = 0;

      // get the price of the product
      if (cartProduct.groupId) {
        // if cartProduct has a groupId, then fetch the group with matching id
        const matchingGrp = product.groups.find((group) => group._id === cartProduct.groupId);
        price = matchingGrp?.price || product.sellingPrice;
      } else {
        price = product.sellingPrice;
      }

      products.push({ ...cartProduct, price });
    });
  }

  return (
    <CartContextProvider initialState={{ products: [...products] }} reducer={reducer}>
      <CartPage />
    </CartContextProvider>
  )
}

export default CartWrapper