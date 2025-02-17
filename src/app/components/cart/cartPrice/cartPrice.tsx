'use client';

import { useContext, useEffect, useState } from 'react';
import styles from './cartPrice.module.css';
import { CartContext } from '../../../context/cart/provider';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BeatLoader, ClipLoader } from 'react-spinners';
import { changeNewQuantity, updateQuantity } from '../../../../actions/cart';

type QuantityErrorType = { 
  cartProductId: string,
  productId: string,
  variant?: string,
  name: string, 
  cartQuantity: number, 
  availableQuantity: number
};

function CartPrice() {
  const router = useRouter();

  const {state, dispatch} = useContext(CartContext);

  // different sub-total price of the cart
  const [productPrice, setProductPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  // cart total
  const [total, setTotal] = useState(0);

  // state to depict loading state of the component
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);

  // state to display the errors thrown by syncing cart with server
  const [displayError, setDisplayError] = useState(false);
  const [syncErrors, setSyncErrors] = useState<QuantityErrorType[]>([]);

  useEffect(() => {
    // function to calculate total price of the cart
    function calculateTotal() {
      let tempProductPrice = 0, tempDiscount = 0, tempShipping = 0;

      // calculate total price and remove discount
      state.products.map((product) => {
        const productPrice = product.price!;
        const quantity = product.quantity;

        let price = productPrice * quantity
        const discountAmt = product.productId.discount * quantity;
        
        tempProductPrice += price;
        tempDiscount += discountAmt;
      });

      setProductPrice(tempProductPrice);
      setDiscount(tempDiscount);

      setTotal(tempProductPrice - tempDiscount + tempShipping);
    }

    calculateTotal();
  }, [state]);

  /* this function is to proceed to next step (checkout)
     before that, we have to sync the cart data with the server and db
  */
  async function proceedToCheckout() {
    setIsLoading(true);

    try {
      const res = await axios.get('/api/cart/sync');
      const { cart, errors } = res.data;

      if (errors.length > 0) {
        setSyncErrors(errors);
        setDisplayError(true);
      } else {
        router.replace('/checkout');
      }
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateQuantityOfEachProduct(
    cartProductId: string, 
    productId: string, 
    newQuantity: number,
    name: string
  ) {
    try {
      const result = await changeNewQuantity(productId, cartProductId, newQuantity);

      if (result.error) {
        toast.error(`Couldn't update quantity of the product ${name}`)
      } else {
        dispatch({type: 'update_quantity', payload: {
          cartProductId,
          newQuantity,
        }});
        toast.success(`Quantity of the product ${name} updated.`);
      }
    } catch (error) {
      toast.error(`Couldn't update quantity of the product ${name}`)
    }
  }

  async function updateAllErrQuantity() {
    setIsUpdatingQuantity(true);

    try {
      for (let i = 0; i < syncErrors.length; i += 1) {
        const err = syncErrors[i];
        await updateQuantityOfEachProduct(
          err.cartProductId, 
          err.productId, 
          err.availableQuantity, 
          err.name
        );
      }
      
      setDisplayError(false);
      setSyncErrors([]);
    } catch (error: any) {
      toast.error(error?.message || 'Error updating quantity in cart');
    } finally {
      setIsUpdatingQuantity(false);
    }
  }

  return (
    <div className={styles.cart_price_container}>
      <h2>PRICE DETAILS</h2>

      <div className={styles.entry_container}>
        <div className={styles.entry}>
          <span>Price ({state.products.length} Items)</span>
          <span className={styles.entry_val}>₹ {productPrice.toLocaleString('en-IN')}</span>
        </div>

        <div className={styles.entry}>
          <span>Discount</span>
          {(discount > 0) ?
            <span className={`${styles.entry_val} ${styles.green_font}`}>-₹ {discount.toLocaleString('en-IN')}</span>:
            <span className={styles.entry_val}>₹ 0</span>
          }
        </div>

        <div className={styles.entry}>
          <span>Delivery Charges</span>
          {(shipping > 0) ?
            <span className={styles.entry_val}>+₹ {discount.toLocaleString('en-IN')}</span>:
            <span className={`${styles.entry_val} ${styles.green_font}`}>Free</span>
          }
        </div>
      </div>

      <div className={styles.total_price_container}>
        <span>Total Amount</span>
        <span>₹ {total.toLocaleString('en-IN')}</span>
      </div>

      {/* error container */}
      {displayError &&
        (<section className={styles.error_container}>
          <div className={styles.error_inner_container}>
            <div className={styles.note}>
              <h1>OOPS!!</h1>
              <p>Leaving products in cart for too long causes this..</p>
            </div>

            {syncErrors.map((syncError, idx) => {
              return (
                <div className={styles.error} key={idx}>
                  The available quantity for '{syncError.name}' 
                  {(syncError.variant) ? ` (variant: ${syncError.variant})` : ''} is {syncError.availableQuantity}, 
                  but you have added {syncError.cartQuantity} to your cart. Please adjust the quantity.
                </div>
              )
            })}   

            <div className={styles.error_actions}>
              <button onClick={() => updateAllErrQuantity()}>
                {(isUpdatingQuantity) ?
                  <ClipLoader />:  
                  'Update quantity'
                }
              </button>
              <button onClick={() => setDisplayError(false)}>Do it manually</button>
            </div>
          </div>
        </section>)
      }

      <button 
        className={styles.checkout_btn}
        onClick={() => proceedToCheckout()}
      >
        {(isLoading) ?
          <BeatLoader /> :
          'Proceed to checkout'
        }
      </button>
    </div>
  );
}

export default CartPrice;
