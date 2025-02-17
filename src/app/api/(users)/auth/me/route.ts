import { verifyToken } from '../../../../../helpers/jwt';
import dbConnect from '../../../../../lib/dbConnect';
import Cart from '../../../../../models/cart';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // retrieve the token stored in the cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    // if the token is not present, user is not authenticated
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthenticated' },
        { status: 401 }
      )
    }
    
    // verify the user and return the info
    const decodedToken = await verifyToken(token);

    // get the userId and add the cartId to cookie
    await dbConnect();
    const userId = decodedToken.userId;

    // TODO: optimise this database call by using redis possibly
    const cart = await Cart.findOne({userId, status: 'active'});

    return NextResponse.json(
      { 
        message: 'Authenticated',
        user: {
          userId: decodedToken.userId,
          email: decodedToken.email,
        },
        cart: {
          cartId: cart?._id || '',
          productCount: cart?.products.length || 0,
        }
      }, 
      { status: 200 }
    );
  } catch (error: any) {
    // if the error is because of the jwtoken expiry, the user is unauthenticated
    if (error && error.code) {
      if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
        return NextResponse.json(
          { message: 'Invalid token' },
          { status: 400 }
        );
      } else if (error.code === 'ERR_JWT_EXPIRED') {
        return NextResponse.json(
          { message: 'Unauthenticated' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}