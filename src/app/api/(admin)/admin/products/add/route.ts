import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AddProductValidationSchema } from '../../../../../../validation/product';
import Product from '../../../../../../models/product';
import dbConnect from '../../../../../../lib/dbConnect';
import { revalidatePath } from 'next/cache';

const ROOT_DIR = process.cwd();
const UPLOAD_DIR = join(ROOT_DIR, 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // get all the images and product data
    const productData = JSON.parse(formData.get('productData') as string);
    const images = formData.getAll('images') as File[];

    // if any of the data is missing return error
    if (!productData || !images) {
      return NextResponse.json(
        { message: 'Missing data.' },
        { status: 400 }
      );
    }

    // if the images are absent return error
    if (images.length === 0) {
      return NextResponse.json(
        { message: 'Please upload product images' },
        { status: 400 }
      );
    }

    // check the validity of the data recieved and return appropriate errors
    const validateData = AddProductValidationSchema.safeParse(productData);        
    if (validateData.success === false) {
      let errorMessage = '';
      const errorObj: { [key:string]: string } = {};

      validateData.error.errors.forEach((error) => {
        errorMessage += `${error.message}\n`;
        errorObj[error.path[0]] = error.message;
      });

      return NextResponse.json(
        { 
          message: errorMessage,
          error: errorObj,
        }, 
        { status: 400 }
      );
    }

    // save other product data to db and retrieve the productId
    await dbConnect();
    const newProduct = new Product(validateData.data);

    // write the images to the /uploads folder
    // TODO: upload images to cloud storage
    const imagePaths = [];
    for(let i = 0; i < images.length; i += 1) {
      const image = images[i];

      // get file extension
      const extension = image.name.split('.').pop();

      const imagePath = `${UPLOAD_DIR}/${newProduct._id}_${i}.${extension}`;

       // track all the image urls to store in db
      const imageUrl = `/uploads/${newProduct._id}_${i}.${extension}`;
      imagePaths.push(imageUrl);

      const bytes = await image.arrayBuffer();
      const imgBuffer = Buffer.from(bytes);
      await writeFile(imagePath, imgBuffer);
    };

    // add the images to the product
    newProduct.images = imagePaths;

    await newProduct.save();

    // revalidate the store cache
    revalidatePath('/store');

    return NextResponse.json(
      { message: 'Successfully added product.' },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}