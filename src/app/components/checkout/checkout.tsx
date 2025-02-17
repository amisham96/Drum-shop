'use client';

import { Address } from '../../../types/address';
import styles from './checkout.module.css';
import { CartType } from '../../../types/cart';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CheckoutProduct from './checkoutProduct/checkoutProduct';
import CheckoutPrice from './checkoutPrice/checkoutPrice';
import toast from 'react-hot-toast';
import axios from 'axios';
import { OrderType } from '../../../validation/order';

type PropsType = {
  cart: CartType | null,
  address: Address[]
}

function CheckoutPage(props: PropsType) {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cart, setCart] = useState<CartType | null>(null);

  // state to maintain selected address
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // function to proceed to the payment stage
  async function proceedToPayment() {
    if (!cart) return;
    setIsLoading(true);

    try {
      const res = await axios.post('/api/orders', {
        cartId: cart._id, 
        addressId: selectedAddressId,
      });
      
      const order: OrderType = res.data.order;
      const orderId = order._id;
      toast.success('Redirecting to payment page...');
      router.replace(`/payment?orderId=${orderId}`);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setCart(props.cart);
    setAddresses(props.address);

    if (props.address.length > 0) {
      setSelectedAddressId(props.address[0]._id);
    }
  }, [setCart, setAddresses, props]);

  return (
    <div className={styles.checkout_outer_container}>
      <div className={styles.left_grid}>
        
        {/* Address container */}
        <div className={styles.address_container}>
          <h2>DELIVERY ADDRESS</h2>

          {addresses.map((address, idx) => {
            return (
              <div className={styles.address} key={idx}>
                <input 
                  type='radio'
                  checked={(address._id === selectedAddressId)}
                  onChange={() => setSelectedAddressId(address._id)}
                />

                <div>
                  <div className={styles.first_line}>
                    <span className={styles.name}>{address.name} </span>
                    <span className={styles.phone}>{address.phone}</span>
                    <span className={styles.address_type}>{address.addressType.toUpperCase()}</span>
                  </div>

                  <p>{address.address}</p>
                  <div>
                    <span>{address.city + ', '}</span>
                    <span>{address.state + ', '}</span>
                    <span>{address.pinCode}</span>
                  </div>
                </div>
              </div>
            )
          })}

          <Link
            className={styles.address_actions}
            href={'/profile?type=address'}
          >
            Manage Addresses
          </Link>
        </div>

        {/* Order summary container */}
        <div className={styles.order_summary_container}>
          <h2>ORDER SUMMARY</h2>

          {cart?.products.map((product, idx) => {
            return (
              <CheckoutProduct 
                product={product} 
                key={idx} 
              />
            );
          })}
        </div>
      </div> 

      {/* checkout price container */}
      <div className={styles.right_grid}>
        <CheckoutPrice 
          cart={cart} 
          proceedToPayment={proceedToPayment}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default CheckoutPage;
