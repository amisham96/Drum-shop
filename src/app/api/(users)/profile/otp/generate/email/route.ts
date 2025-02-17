import generateOTP from '../../../../../../../helpers/generateOTP';
import { NextRequest, NextResponse } from 'next/server';
import redisClient from '../../../../../../../lib/redisClient';
import User from '../../../../../../../models/user';
import dbConnect from '../../../../../../../lib/dbConnect';

export async function POST(req: NextRequest) {
  try {
    // get the email from the req body
    const reqBody = await req.json();
    const email: string = reqBody.email;
    
    // if email is absent, return error
    if (!email) {
      return NextResponse.json(
        { message: 'Missing parameter: email' }, 
        { status: 400 }
      );
    }

    await dbConnect();

    // check if the email already exists in the db
    const user = await User.findOne({ email });

    if (user) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }

    // generate an otp
    const otp = generateOTP();
  
    // set this otp in redis database for a min
    await redisClient.set(email, otp, {ex: 180});
  
    return NextResponse.json(
      { message: 'OTP generated successfully' },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}