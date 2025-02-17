import PaymentPage from '../../../components/payment/payment';
import { OrderWithUserType } from '../../../../validation/order';

async function fetchOrder(orderId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${orderId}`,
      {cache: 'no-store'}
    );

    const data = await res.json();
    return data;
  } catch (error) {
    return { order: null, error }
  }
}

async function Payment(
  { searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }
) {
  const orderId = (await searchParams).orderId;

  // TODO: handle this error in the payment page
  if (!orderId) {
    return 'Order ID not defined';
  }

  const data: { order: OrderWithUserType } = await fetchOrder(orderId);
  
  return (
    <PaymentPage 
      order={data.order}
      user={data.order.userId}
    />
  )
}

export default Payment