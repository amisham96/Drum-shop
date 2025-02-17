import { verifyToken } from '../../../../helpers/jwt';
import dbConnect from '../../../../lib/dbConnect';
import Cart from '../../../../models/cart';
import ShippingAddress from '../../../../models/shippingAddress';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userTokenCookie = req.cookies.get('token');  

  // if the user is unauthenticated, cart info is not saved in the db
  if (!userTokenCookie) {
    return NextResponse.json(
      { message: 'Unauthenticated' },
      { status: 401 }
    );
  }

  try {
    // fetch all the items from the inventory
    const userToken = userTokenCookie.value;

    // get the userId saved in the token
    const userData = await verifyToken(userToken);

    await dbConnect();

    // retrieve the cart using the userId
    const cart = await Cart.findOne({ 
                              userId: userData.userId,
                              status: 'active',
                            })
                           .populate({ 
                              path: 'products.productId',
                              
                              // do not send these fields to frontend
                              select: '-costPrice -cgst -sgst' 
                            });

    //  retrieve the addresses of the user
    const address = await ShippingAddress.find({userId: userData.userId});

    return NextResponse.json({
      message: 'Successfully retrieved cart',
      cart,
      address,
    });
  } catch (error) {    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}