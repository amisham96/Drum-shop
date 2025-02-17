import dbConnect from '../../../../../lib/dbConnect';
import Order from '../../../../../models/order';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  try {
    const orderStatus = searchParams.get('orderStatus') || 'pending';
    const paymentStatus = searchParams.get('paymentStatus') || 'paid';
    const pageNumber = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');

    console.log({
      orderStatus,
      paymentStatus,
      pageNumber,
      limit
    });

    await dbConnect();

    const docsToSkip = (pageNumber * limit);

    const orders = await Order.find({ orderStatus, paymentStatus })
                              .sort({ createdAt: 1 })
                              .skip(docsToSkip)
                              .limit(limit);

    const orderCount = await Order.countDocuments();

    return NextResponse.json({
      message: 'Successfully retrieved items',
      orders,
      orderCount,
    });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}