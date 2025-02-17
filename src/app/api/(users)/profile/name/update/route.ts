import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../../../helpers/jwt';
import dbConnect from '../../../../../../lib/dbConnect';
import User from '../../../../../../models/user';

export async function POST(req: NextRequest) {
  try {
    // get the name from the req body
    const reqBody = await req.json();
    const name: string = reqBody.name;

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
    if (!name) {
      return NextResponse.json(
        { message: 'Missing parameter: name' }, 
        { status: 400 }
      );
    }
  
    await dbConnect();

    const decodedToken = await verifyToken(token);
    const userId = decodedToken.userId;

    await User.findByIdAndUpdate(userId, { fullName: name });

    return NextResponse.json(
      { message: 'Name updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}