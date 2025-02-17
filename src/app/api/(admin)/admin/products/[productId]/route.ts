import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/dbConnect';
import Product from '../../../../../../models/product';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { productId: string }}
) {
  // get the productId from dynamic url 
  const { productId } = params;

  // if the productId is invalid mongodb objectId, return error.
  if (mongoose.isValidObjectId(productId) === false) {
    return NextResponse.json(
      { message: 'Invalid product id' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // fetch the product from db
    const product = await Product.findById(productId)

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: 'Successfully retrieved product from db',
        product,
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