import {SignJWT, jwtVerify} from  'jose';

type JWTPayload = {
  userId: string, // user id
  email: string, // user email
  isAdmin: boolean,
  privilege: string,
  exp: number,
}

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);

// function to sign data into a JWT token
export async function signToken(
  user: {email: string, _id: string, isAdmin: boolean, privilege: string}
) {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    isAdmin: user.isAdmin,
    privilege: user.privilege,
    exp: Math.floor(Date.now()/1000) + (7 * 24 * 60 * 60),    
  }

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);

  return jwt;
}

// function to verify a JWT token and get the decoded data
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as JWTPayload;
  } catch (error) {
    throw error;
  }
}

/* function to check if the token is still valid, and if it is valid,
  get the time till expiration */
export async function getTokenValidity(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    const jwtData = payload as JWTPayload;
    const tokenExpirationTime = jwtData.exp;
    const currTime = Math.floor(Date.now() / 1000);

    // time till which the token will be valid (in seconds)
    const validTime = tokenExpirationTime - currTime;
    return {
      ...jwtData,
      validTime: validTime,
      expired: false,
    };
  } catch (error) {
    return { expired: true };
  }
}
