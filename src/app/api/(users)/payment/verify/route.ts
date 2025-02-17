import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Payment from '../../../../../models/payment';
import dbConnect from '../../../../../lib/dbConnect';
import Order from '../../../../../models/order';
import Cart from '../../../../../models/cart';
import { OrderType } from '../../../../../validation/order';

const generatedSignature = (
 razorpayOrderId: string,
 razorpayPaymentId: string
) => {
 const keySecret = process.env.NEXT_RAZORPAY_SECRET_KEY! ;
 if (!keySecret) {
  throw new Error(
   'Razorpay key secret is not defined in environment variables.'
  );
 }
 
 const sig = crypto
  .createHmac('sha256', keySecret)
  .update(razorpayOrderId + '|' + razorpayPaymentId)
  .digest('hex');
 return sig;
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { orderId, orderCreationId, razorpayPaymentId,razorpaySignature } = data;

    const signature = generatedSignature(orderCreationId, razorpayPaymentId);

    // verify the signature
    if (signature !== razorpaySignature) {
     return NextResponse.json(
      { message: 'Payment verification failed', isOk: false },
      { status: 400 }
     );
    } 
   
    await dbConnect();

    // save the payment details
    const newPayment = new Payment({
      orderId,
      razorpayOrderId: orderCreationId,
      razorpayPaymentId,
      razorpaySignature
    });

    await newPayment.save();

    // update order information
    const order: (OrderType | null) = await Order.findByIdAndUpdate(
      orderId, 
      { paymentStatus: 'paid' }, 
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 400 }
      );  
    }

    // update the cart
    const cartId = order.cartId;
    await Cart.findByIdAndUpdate(order.cartId, { status: 'inactive' });
    
    return NextResponse.json(
      { message: 'Payment verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
