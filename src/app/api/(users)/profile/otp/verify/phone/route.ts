import { NextRequest, NextResponse } from 'next/server';
import redisClient from '../../../../../../../lib/redisClient';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../../../../helpers/jwt';
import dbConnect from '../../../../../../../lib/dbConnect';
import User from '../../../../../../../models/user';

export async function POST(req: NextRequest) {
  try {
    // get the email from the req body
    const reqBody = await req.json();
    const phone: string = reqBody.phone;
    const otp: string = reqBody.otp;

    // retrieve the token stored in the cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthenticated' }, 
        { status: 401 }
      );
    }
    
    // if email is absent, return error
    if (!phone) {
      return NextResponse.json(
        { message: 'Missing parameter: phone' }, 
        { status: 400 }
      );
    }

    // if otp is absent, return error
    if (!otp) {
      return NextResponse.json(
        { message: 'Missing parameter: OTP' }, 
        { status: 400 }
      );
    }

    // get the otp from redis
    const generatedOTP = await redisClient.get(phone);

    // if the user did not generate otp previously, return error
    if (!generatedOTP) {
      return NextResponse.json(
        { message: 'Please generate otp first.' }, 
        { status: 400 }
      );
    }

    // verify if the otp match
    if (generatedOTP.toString() !== otp) {
      return NextResponse.json(
        { message: 'Incorrect OTP' }, 
        { status: 400 }
      );
    }    
  
    await dbConnect();

    // after the email is verified successfully, update the user's email
    const decodedToken = await verifyToken(token);
    const userId = decodedToken.userId;

    await User.findByIdAndUpdate(userId, { phone });

    return NextResponse.json(
      { message: 'Phone number updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}