import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'node:fs/promises';
import mongoose from 'mongoose';
import { join } from 'node:path'
;
import { AddProductValidationSchema } from '../../../../../../../validation/product';
import Product from '../../../../../../../models/product';
import dbConnect from '../../../../../../../lib/dbConnect';
import { ProductType } from '../../../../../../../types/product';
import { revalidatePath } from 'next/cache';

const ROOT_DIR = process.cwd();
const UPLOAD_DIR = join(ROOT_DIR, 'public', 'uploads');

type OldImageType = {
  url: string,
  delete: boolean,
  isPrimary: boolean,
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string }},
) {
  const { productId } = params;

  try {
    // if the product id is invalid return error
    if (mongoose.isValidObjectId(productId) === false) {
      return NextResponse.json(
        { message: 'Invalid product id' }, 
        { status: 400 }
      );
    }

    // get all the images and product data from the request object.
    const formData = await req.formData();
    const productData = JSON.parse(formData.get('productData') as string);
    const uploadedImages = formData.getAll('images') as File[];
    const oldImages: OldImageType[] = JSON.parse(formData.get('oldImages') as string);

    // if any of the data is missing return error
    if (!productData || (!uploadedImages && !oldImages)) {
      return NextResponse.json(
        { message: 'Missing data' },
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

    // get the images marked to be deleted
    let imagesToDelete: OldImageType[] = [];
    oldImages.forEach((img) => {
      if (img.delete === true) {
        imagesToDelete.push(img);
      }
    });

    // no images uploaded and all the old images are deleted, then return error
    if ((uploadedImages.length === 0) && (imagesToDelete.length === oldImages.length)) {
      return NextResponse.json(
        { message: 'Please upload product images' },
        { status: 400 }
      );
    }

    //////////////////////////////////// Data validation errors so far //////////////////////////////////////

    await dbConnect();

    // retrieve the product
    const product: (ProductType | null) = await Product.findById(productId);

    // if the product is not present, return error
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' }, 
        { status: 400 }
      );
    }
    
    /**
     * Operations to be performed on the images
     * (1). delete the images tagged for removal
     * (2). upload new images
     * (3). check for the primary image
    */

    // (1). delete the images tagged for removal
    let filteredImgs: string[] = [];
    if (imagesToDelete.length > 0) {
      // add the urls of the image to be deleted to the set
      const removeImgsIdx = new Set();
      
      imagesToDelete.forEach(async (imgToDelete) => {
        removeImgsIdx.add(imgToDelete.url);
        
        const PUBLIC_DIR = join(ROOT_DIR, 'public');
        await unlink(`${PUBLIC_DIR}/${imgToDelete.url}`);        
      });

      // from the stored images, filter out the images not to be deleted.
      product.images.forEach((imgUrl) => {
        if (removeImgsIdx.has(imgUrl) === false) {
          filteredImgs.push(imgUrl);
        }
      });
    } else {
      filteredImgs = [...product.images];
    }

    // (2). upload new images
    const uploadedImagePaths = [];
    if (uploadedImages.length > 0) {
      // write the images to the /uploads folder
      // TODO: upload images to cloud storage

      // avoid duplicate image names
      let imageIndex = filteredImgs.length;

      for(let i = 0; i < uploadedImages.length; i += 1) {
        const image = uploadedImages[i];
  
        // get file extension
        const extension = image.name.split('.').pop();
  
        const imagePath = `${UPLOAD_DIR}/${product._id}_${imageIndex}.${extension}`;
  
         // track all the image urls to store in db
        const imageUrl = `/uploads/${product._id}_${imageIndex}.${extension}`;
        uploadedImagePaths.push(imageUrl);
  
        const bytes = await image.arrayBuffer();
        const imgBuffer = Buffer.from(bytes);
        await writeFile(imagePath, imgBuffer);

        imageIndex += 1;
      };
    }

    // (3). check for the primary image
    // check if the primary image is from the oldImages
    let primaryImg = oldImages.find((img) => (img.delete === false) && (img.isPrimary === true));
    let allImgPaths: string[] = [];

    // now handle the primary image
    if (primaryImg) {
      // if the primary image was in the old images, then add it to the start of the path
      const primaryImgUrl = primaryImg.url;
      const otherImgs = filteredImgs.filter((imgUrl) => imgUrl !== primaryImgUrl);

      allImgPaths = [primaryImgUrl, ...otherImgs, ...uploadedImagePaths];
    } else {
      // if the primary image was not in the old images, then it must be in new images
      allImgPaths = [...uploadedImagePaths, ...filteredImgs];
    }

    // add the images to the product
    await Product.findByIdAndUpdate(productId, {...validateData.data, images: allImgPaths });

    // revalidate cache
    revalidatePath('/store');
    revalidatePath(`/products/${productId}`);

    return NextResponse.json(
      { message: 'Successfully edited product.' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}