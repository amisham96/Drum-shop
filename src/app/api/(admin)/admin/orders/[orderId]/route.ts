import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/dbConnect';
import mongoose from 'mongoose';
import Order from '../../../../../../models/order';

export async function GET(
  req: Request,
  { params }: { params: { orderId: string }}
) {
  // get the eventId from dynamic url 
  const { orderId } = params;

  // if the eventId is invalid mongodb objectId, return error.
  if (mongoose.isValidObjectId(orderId) === false) {
    return NextResponse.json(
      { message: 'Invalid order id' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const order = await Order.findById(orderId)
                            .populate({
                              path: 'cartId',
                              populate: {
                                path: 'products.productId', // Populate product details inside the cart
                              },
                            });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: 'Successfully retrieved order',
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}