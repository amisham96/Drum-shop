import dbConnect from '../../../../../lib/dbConnect';
import Order from '../../../../../models/order';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string }}
) {
  try {
    await dbConnect();

    const { orderId } = params;
    const order = await Order.findById(orderId).populate('userId');

    return NextResponse.json(
      { order: order }, 
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}