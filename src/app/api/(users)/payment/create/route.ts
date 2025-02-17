import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import Order from '../../../../../models/order';
import { OrderType } from '../../../../../validation/order';

const razorpay = new Razorpay({
 key_id: process.env.NEXT_RAZORPAY_KEY_ID!,
 key_secret: process.env.NEXT_RAZORPAY_SECRET_KEY!
});

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const orderId = reqBody.orderId;

    if (!orderId) {
      return NextResponse.json(
        { message: 'Invalid order ID' }, 
        { status: 400 }
      );
    }

    const currOrder: (OrderType | null) = await Order.findById(orderId);

    if (!currOrder) {
      return NextResponse.json(
        { message: 'Order not found' }, 
        { status: 404 }
      );
    }

    const options = {
      // amount: (currOrder.total * 100), // amount should be specified in sub-unit of the currencies
      amount: (100 * 100),
      currency: 'INR',
      receipt: 'rcp1',
    };

    const rpOrder = await razorpay.orders.create(options);

    return NextResponse.json(
      { 
        orderId: rpOrder.id, 
        amount: options.amount, 
        currency: options.currency 
      }, 
      { status: 200 }
    );
 } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
 }
}
