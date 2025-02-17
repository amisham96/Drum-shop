/*
  Description: contains a single route that takes email
  and adds a otp to that email in redis
*/

import generateOTP from '../../../../../../helpers/generateOTP';
import { NextRequest, NextResponse } from 'next/server';
import redisClient from '../../../../../../lib/redisClient';
import { sendSignUpOtpTemplate } from '../../../../../../helpers/email/sendOtp.template';
import { sendEmail } from '../../../../../../helpers/email/sendMail';

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

    // generate an otp
    const otp = generateOTP();
    const {html, plainText} = sendSignUpOtpTemplate(otp);

    // send an email
    const emailRes = await sendEmail({
      subject: 'OTP for user signup', 
      recipientAddress: 'tejasftw117@gmail.com', // TODO: change email address
      html, 
      plainText, 
    });

    if (emailRes.success === false) {
      throw 'Email not sent';
    }
  
    // set this otp in redis database for a min
    await redisClient.set(email, otp, {ex: 180});
  
    return NextResponse.json(
      { message: 'OTP generated successfully' },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}