import { NextRequest, NextResponse } from 'next/server';
import redisClient from '../../../../../../../lib/redisClient';
import { cookies } from 'next/headers';
import { signToken, verifyToken } from '../../../../../../../helpers/jwt';
import dbConnect from '../../../../../../../lib/dbConnect';
import User from '../../../../../../../models/user';

export async function POST(req: NextRequest) {
  try {
    // get the email from the req body
    const reqBody = await req.json();
    const email: string = reqBody.email;
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
    if (!email) {
      return NextResponse.json(
        { message: 'Missing parameter: email' }, 
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
    const generatedOTP = await redisClient.get(email);

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

    const updatedUser = await User.findByIdAndUpdate(userId, { email }, { new: true });

    // update jwtoken
    const jwtoken = await signToken(updatedUser);
    
    const response = NextResponse.json(
      { 
        message: 'Email updated successfully',
      },
      { status: 200 }
    );
    response.cookies.set({
      name: 'token',
      value: jwtoken,
      sameSite: 'strict',
      httpOnly: true,
      secure: (process.env.NODE_ENV === 'production'), // secure only on production environment
      expires: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // expiry in 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}