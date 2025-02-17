'use client';

import { FaLongArrowAltRight } from 'react-icons/fa';
import styles from './cart.module.css';
import CartProduct from './cartProduct/cartProduct';
import CartPrice from './cartPrice/cartPrice';

import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../../context/cart/provider';
import { CartProductWithPrice } from '../../../types/cart';

function Cart() {
  const {state, dispatch} = useContext(CartContext);

  const [products, setProducts] = useState<CartProductWithPrice[]>([]);

  useEffect(() => {
    setProducts(state.products);
  }, [state.products]);

  return (
    <div className={styles.outer_container}>
      <p className={styles.top_heading}>
        Want to call the store to place an order? Call us now
        <FaLongArrowAltRight className={styles.arrow_icon} />
      </p>

      <h1 className={styles.cart_heading}>YOUR CART</h1>

      {/* container containing all the cart info */}
        <div className={styles.cart_container}>
          
          {/* container containing product info in cart */}
          <div className={styles.left_container}>
            {products.map((cartProduct, idx) => {
              return (
                <CartProduct 
                  cartProductId={cartProduct._id} 
                  key={idx} 
                />
              );
            })}
          </div>

          {/* container containing price details */}
          <div className={styles.right_container}>
            <CartPrice />
          </div>
        </div>
    </div>
  );
}

export default Cart