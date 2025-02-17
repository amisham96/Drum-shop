import { signToken } from '../../../../../helpers/jwt';
import dbConnect from '../../../../../lib/dbConnect';
import User from '../../../../../models/user';
import { LoginValidationSchema } from '../../../../../validation/user';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const email: string = reqBody.email;

    if (!reqBody.captcha) {
      return NextResponse.json(
        { message: 'Invalid captcha code' },
        { status: 422 }
      )
    }

    // verify the google recaptcha
    const verifyCaptchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${reqBody.captcha}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        method: 'POST',
      }
    );

    const captchaValidation = await verifyCaptchaRes.json();
    if (captchaValidation.success === false) {
      return NextResponse.json(
        { message: 'reCAPTCHA expired' },
        { status: 400 }
      )
    }

    // check if the other data is valid
    const validationRes = LoginValidationSchema.safeParse(reqBody);

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

    // check if the user exists in the db
    const existingUser = await User.findOne({
      $or: [
        { phone: email }, 
        { email: email }
      ]
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' }, 
        { status: 404 }
      );
    }

    // if the user exists, check if the password is valid
    const validPassword = await existingUser.isValidPassword(reqBody.password);
    
    if (!validPassword) {
      return NextResponse.json(
        { message: 'Incorrect username or password'},
        { status: 401 }
      )  
    }

    // generate a jwt and add it to the cookies
    const jwtoken = await signToken(existingUser);

    const response = NextResponse.json(
      { 
        message: 'Login successful',
        token: jwtoken
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
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}