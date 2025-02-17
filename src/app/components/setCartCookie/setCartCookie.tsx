/**
 * File: setCartCookie.tsx
 * Description: This is a client component specifcally designed 
 * to add a cookie storing cartId to the browser. This can be achieved only
 * on client component in our context, hence this component doesn't return
 * anything
 */

'use client';

import Cookies from 'js-cookie';
import { useEffect } from 'react';

type CartPropType = {
  cartId: string,
  productCount: number,
}

function SetCartCookie(
  { cart }: { cart: (CartPropType | null) }
) {
  useEffect(() => {
    const cartCookie = Cookies.get('cart');
    
    // if the cart cookie doesn't exist (initial render) add the cookie
    if (!cartCookie) {
      if (cart?.cartId) Cookies.set('cartId', cart?.cartId)
      if (cart?.productCount) Cookies.set('cartCount', cart.productCount.toString())
    }
  }, [cart]);

  return (null);
}

export default SetCartCookie;
