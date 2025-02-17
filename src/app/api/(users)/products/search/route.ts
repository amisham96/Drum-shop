import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Product from '../../../../../models/product';
import { ProductType } from '../../../../../types/product';

export async function GET(
  req: NextRequest,
) {
  // get the searchQuery to search a product
  const searchParams = req.nextUrl.searchParams;
  const searchQuery = searchParams.get('query');
  const brand = searchParams.get('brand');

  try {
    await dbConnect();

    let products: ProductType[] = [];
    
    if ((searchQuery) && (searchQuery.length > 0)) {
      // fetch the matching products from db
      products = await Product.find({ $text: { $search: searchQuery } })
                              .sort({ score: { $meta: 'textScore' } })
                              .select('-costPrice')
                              .exec();
                              
    } else if ((brand) && (brand.length > 0)) {
      const formatBrand = brand[0].toUpperCase() + brand.slice(1).toLowerCase();
      products = await Product.find({ brand: formatBrand });
    } else {
      return NextResponse.json(
        { message: 'Invalid search query.' },
        { status: 400 },
      );
    }
    
    // TODO: implement pagination

    return NextResponse.json(
      {
        message: 'Successfully retrieved product from db',
        products,
      },
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