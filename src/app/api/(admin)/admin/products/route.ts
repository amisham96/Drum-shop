import dbConnect from '../../../../../lib/dbConnect';
import Product from '../../../../../models/product';
import { ProductType } from '../../../../../types/product';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const pagination = searchParams.get('pagination') || '';

  try {
    await dbConnect();

    if (pagination === true.toString()) {
      const pageNumber = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      const docsToSkip = (pageNumber * limit);
  
      // TODO: optimise pagination
      const products: ProductType[] = await Product.find({}).sort({createdAt: -1}).skip(docsToSkip).limit(limit);
  
      return NextResponse.json({
          message: 'Successfully retrieved items',
          products,
      });
    } else {
      const param = searchParams.get('param') || '';
      const value = searchParams.get('value') || '';

      const validParmas = ['id', 'name', 'hsnCode'];
      if ((!validParmas.includes(param)) || (!value)) {
        return NextResponse.json(
          { message: 'Invalid search parameters' },
          { status: 400 },
        );
      }

      // construct the search query based on the parameter
      let query;
      let products: ProductType[] = [];

      if (param === 'name') {
        products = await Product.find(
          { $text: { $search: value } },
          { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(20);
      } else if (param === 'id') {
        query = { _id: value };
        products = await Product.find(query);
      } else if (param === 'hsnCode') {  
        query = { hsnCode: value };
        products = await Product.find(query);
      }

      return NextResponse.json({
        message: 'Successfully retrieved items',
        products,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}