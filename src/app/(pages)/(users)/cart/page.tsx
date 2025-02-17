import CartWrapper from '../../../components/cart/cartWrapper/cartWrapper';
import NeedHelp from '../../../components/needHelp/needHelp';
import { cookies } from 'next/headers';

// function to fetch cart data of the user
async function fetchCart() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`,
    { 
      cache: 'no-store',
      headers: { 
        Cookie: cookies().toString()
      },
    },
  );
    
  const data = await res.json();
  return data;
}

async function Cart() {
  const data = await fetchCart();

  return (
    <main>
      <CartWrapper cart={data?.cart || null} />
      <NeedHelp />
    </main>
  );
}

export default Cart;
