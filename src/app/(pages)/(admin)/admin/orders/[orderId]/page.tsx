'use client';

import { useParams } from 'next/navigation';
import styles from './order.module.css';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { OrderWithCartType } from '../../../../../../validation/order';
import CheckoutProduct from '../../../../../components/checkout/checkoutProduct/checkoutProduct';

function Order() {
  const urlParams = useParams<{orderId: string}>();
  const { orderId } = urlParams;

  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderWithCartType | null>(null);

  async function fetchOrder() {
    if (!orderId || orderId.length == 0) return;
    setIsLoading(true);

    try {
      const res = await axios.get(`/api/admin/orders/${orderId}`);
      const {order} = res.data;
      setOrder(order);
      console.log(order);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);   
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  return (
    <main className={styles.main}>
      <h1>#Order ID - {order?._id}</h1> 

      <div className={styles.outer_container}>
        <section className={styles.products_outer_container}>
          <h2>Products</h2>

          <div className={styles.products_container}>
            {order?.cartId.products?.map((cartProduct, idx) => {
              return (
                <div className={styles.product} key={idx}>
                  <CheckoutProduct product={cartProduct} />
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.address_container}>
          <h2>Shipping Address</h2>

          <div className={styles.address_info}>
            <p>
              <span className={styles.label}>Address: </span>
              {order?.address.address}
            </p>
            <p>
              <span className={styles.label}>Landmark: </span>
              {order?.address.landmark || '-'}
            </p>
            <p>
              <span className={styles.label}>City: </span>
              {order?.address.city}
            </p>
            <p>
              <span className={styles.label}>State: </span>
              {order?.address.state}
            </p>
            <p>
              <span className={styles.label}>Pin Code: </span>
              {order?.address.pinCode}
            </p>
            <p>
              <span className={styles.label}>AddressType: </span>
              {order?.address.addressType}
            </p>
          </div>
        </section>
      </div>
      
      {/* TODO: update order status container */}
      {/* <div className={styles.update_order_container}>
        <form>
          
        </form>
      </div> */}
    </main>
  )
}

export default Order;
