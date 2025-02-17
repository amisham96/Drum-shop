import { NextRequest, NextResponse } from 'next/server';
import redisClient from '../../../../../lib/redisClient';
import { getTokenValidity } from '../../../../../helpers/jwt';

export async function GET(req: NextRequest) {
  try {
    // get the token from the cookies
    const token = req.cookies.get('token')?.value;

    if (token) {
      const tokenValidityRes: any = await getTokenValidity(token);

      // if the token hasn't already expired, then blacklist it
      if (tokenValidityRes.expired === false) {  
        await redisClient.set(`bl_${token}`, token, {ex: tokenValidityRes.validTime});
      }
    }

    // clear the appropriate cookie
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.delete('token');
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}