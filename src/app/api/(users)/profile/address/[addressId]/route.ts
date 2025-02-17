import { verifyToken } from '../../../../../../helpers/jwt';
import dbConnect from '../../../../../../lib/dbConnect';
import ShippingAddressSchema from '../../../../../../validation/shippingAddress';
import ShippingAddress from '../../../../../../models/shippingAddress';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// function to edit a address
export async function PUT(
  req: NextRequest,
  { params }: { params: { addressId: string }}
) {
  try {
    const { addressId } = params;

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
    
    // verify the user and retrieve userId
    await verifyToken(token)
    
    // get the data submitted by the user
    const reqBody = await req.json();

    // validate the data recieved
    const validationRes = ShippingAddressSchema.safeParse(reqBody);
    
    if (validationRes.success === false) {
      let errorMessage = '';
      const errorObj: { [key:string]: string } = {};

      validationRes.error.errors.forEach((error) => {
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

    // edit the address
    await dbConnect();
    await ShippingAddress.findByIdAndUpdate(addressId, { ...validationRes.data });

    return NextResponse.json(
      { message: 'Address successfully edited' }, 
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
          { message: 'Login to perform action.' },
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

// function to delete a address
export async function DELETE(
  req: NextRequest,
  { params }: { params: { addressId: string }}
) {
  try {
    const { addressId } = params;

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
    
    // verify the user and retrieve userId
    await verifyToken(token)
    
    // delete the address
    await dbConnect();
    await ShippingAddress.findByIdAndDelete(addressId);

    return NextResponse.json(
      { message: 'Dddress successfully deleted' }, 
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
          { message: 'Login to perform action.' },
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