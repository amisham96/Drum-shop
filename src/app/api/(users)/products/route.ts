/**
 * The instances where this route is used to return data are
 * 
 * (1). Data to be displayed on the store page.
 *      ex: /api/products?store=true
 * 
 * (2). Data based on a category.
 *      ex: /api/products?category=drums
 *      
 * (3). Data based on the given filters (used for product search)
 *      ex: /api/products?filter=true&query=star
 *      ex: /api/products?filter=true&brand=tama
 * 
 */

import dbConnect from '../../../../lib/dbConnect';
import Product from '../../../../models/product';
import { ProductType } from '../../../../types/product';
import { NextRequest, NextResponse } from 'next/server';

type CategoryDataType = {
  _id: string,
  products: ProductType[],
}

type ResponseType = 
  { categoryData: CategoryDataType[] } |
  { products: ProductType[] }

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  try {
    // get the query params for enabling pagination and deciding the type
    // of data to return
    const category = searchParams.get('category');
    const pageNumber = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const store = searchParams.get('store');

    let data: (ResponseType);

    await dbConnect();

    // if the request is from `store` page, retrieve products from all categories
    if ((store) && (store === true.toString())) {
      const categoryData: CategoryDataType[] = await Product.aggregate([
        {
          '$group': {
            _id: '$category', // group the documents based on the 'category'
            products: { 
              '$topN': {
                n: 5, // get 5 products from each category
                sortBy: { createdAt: -1 }, // gets the latest added products
                output: '$$ROOT'
              }
            },
          }
        },
        {
          '$project': {
            'products.costPrice': 0, // exlude costPrice in the data sent to client
          }
        }
      ]);

      data = { categoryData };
    } 
    else {
      // check if the category is present, else return error
      if (!category) {
        return NextResponse.json(
          { message: 'Category is missing from query param' },
          { status: 400 }
        );
      }

      const docsToSkip = (pageNumber * limit);

      // TODO: pagination could be optimised
      const products: ProductType[] = await Product.find({ category }).sort({createdAt: -1}).skip(docsToSkip).limit(limit);
      data = { products }
    }

    return NextResponse.json(
      { 
        data,
        message: 'Successfully fetched products',
      },
      { status: 200 },
    );    
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}