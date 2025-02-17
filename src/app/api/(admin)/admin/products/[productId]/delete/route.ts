import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { unlink } from 'node:fs/promises'
import { join } from 'node:path';

import dbConnect from '../../../../../../../lib/dbConnect';
import Product from '../../../../../../../models/product';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { productId: string }}
) {
  try {
    const { productId } = params;

    // if the productId is invalid return error
    if ((!productId) || (!mongoose.isValidObjectId(productId))) {
      return NextResponse.json(
        { message: 'Invalid product id' },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 400 }
      );  
    }

    // // delete the images
    product.images.forEach(async (img: string) => {
      // delete each image
      const ROOT_DIR = process.cwd();
      const PUBLIC_DIR = join(ROOT_DIR, 'public');
      await unlink(`${PUBLIC_DIR}/${img}`);
    });

    await Product.findByIdAndDelete(productId);

    // revalidate the cache of the productId and the store
    revalidatePath('/store');
    revalidatePath(`/products/${productId}`);

    return NextResponse.json(
      { message: 'Successfully deleted product' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}