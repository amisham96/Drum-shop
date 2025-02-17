import generateOTP from '../../../../../../../helpers/generateOTP';
import { NextRequest, NextResponse } from 'next/server';
import redisClient from '../../../../../../../lib/redisClient';
import dbConnect from '../../../../../../../lib/dbConnect';
import User from '../../../../../../../models/user';

export async function POST(req: NextRequest) {
  try {
    // get the email from the req body
    const reqBody = await req.json();
    const phone: string = reqBody.phone;
    
    // if email is absent, return error
    if (!phone) {
      return NextResponse.json(
        { message: 'Missing parameter: phone' }, 
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ phone });
    if (user) {
      return NextResponse.json(
        { message: 'Phone number already in use' },
        { status: 400 }
      );
    }

    // generate an otp
    const otp = generateOTP();
  
    // set this otp in redis database for a min
    await redisClient.set(phone, otp, {ex: 180});
  
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