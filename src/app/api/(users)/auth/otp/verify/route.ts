/*
  Description: contains a single route that takes email
  and adds a otp to that email in redis
*/

import { NextRequest, NextResponse } from 'next/server';
import redisClient from '../../../../../../lib/redisClient';

export async function POST(req: NextRequest) {
  try {
    // get the email from the req body
    const reqBody = await req.json();
    const email: string = reqBody.email;
    const otp: string = reqBody.otp;
    
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
  
    // in redis store that this particular user has verified their email
    await redisClient.set(`${email}_verified`, 'true', {ex: 300});

    return NextResponse.json(
      { message: 'OTP verified successfully' },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}