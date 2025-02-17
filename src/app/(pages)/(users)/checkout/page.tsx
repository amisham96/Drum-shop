import CheckoutPage from '../../../components/checkout/checkout';
import styles from './checkout.module.css';
import NeedHelp from '../../../components/needHelp/needHelp';
import { cookies } from 'next/headers';

// function to fetch cart data of the user
async function fetchCheckoutData() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout`,
      { 
        cache: 'no-store',
        headers: { 
          Cookie: cookies().toString()
        },
      },
    );
      
    const data = await res.json();
    return { ...data, error: null };
  } catch (error) {
    return { cart: null, address: [], error }
  }
}

async function Checkout() {
  const { cart, address, error } = await fetchCheckoutData();

  return (
    <main className={styles.main}>
      <h1 className={styles.main_heading}>CHECKOUT</h1>

      {(error) ?
        <div>There was some error while proceeding to checkout stage.</div>:
        (<CheckoutPage
          cart={cart}
          address={address}
        />)
      }
      <NeedHelp />
    </main>
  );
}

export default Checkout;
