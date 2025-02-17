import { verifyToken } from '../../../../../helpers/jwt';
import dbConnect from '../../../../../lib/dbConnect';
import ShippingAddressSchema from '../../../../../validation/shippingAddress';
import ShippingAddress from '../../../../../models/shippingAddress';
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
    
    // verify the user and retrieve userId
    const decodedToken = await verifyToken(token)
    const userId = decodedToken.userId;
    
    // from the userId fetch all the address related to the user
    await dbConnect();
    const allAddress = await ShippingAddress.find({userId});

    return NextResponse.json(
      { allAddress },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    
    // verify the user and retrieve userId
    const decodedToken = await verifyToken(token)
    const userId = decodedToken.userId;
    
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

    await dbConnect();
    
    const data: any = {...validationRes.data};
    data.userId = userId;

    // save the address
    const newAddress = new ShippingAddress(data);
    await newAddress.save();

    return NextResponse.json(
      { message: 'New address successfully saved' }, 
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}