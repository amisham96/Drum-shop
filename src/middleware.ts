import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from './middleware/admin';

const publicPaths = ['/login', '/signup'];
const privatePaths = ['/profile', '/cart', '/checkout', '/payment'];
const adminPaths = ['/admin', '/api/admin'];

export async function middleware(request: NextRequest) {
  // restrict access to pages based on the token present in cookies
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // if the token is present in the cookie, user is already authenticated
  if (publicPaths.includes(path) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // if the user is on admin path
  const isAdminPath = adminPaths.some((adminPath) => path.includes(adminPath));
  
  if (isAdminPath) {
    // if the request has token with it
    if (token) {
      const isAdminUser = await isAdmin(token);

      if (isAdminUser === false) {
        return NextResponse.redirect(new URL('/not-found', request.url));      
      }
    } else {
      // if the token is not present, redirect user to 'login' page
      const url = new URL('/login', request.url);
      url.searchParams.set('message', 'Login to access the page');
      return NextResponse.redirect(url);
    }
  }

  // if the user is in private path
  const isPrivatePath = privatePaths.some((privatePath) => path.includes(privatePath));
  
  if (isPrivatePath) {
    // if the request has token with it
    if (token) {
      return NextResponse.next();
    } else {
      // if the token is not present, redirect user to 'login' page
      const url = new URL('/login', request.url);
      url.searchParams.set('message', 'Login to access the page');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/signup',
    '/login',
    '/profile',
    '/cart',
    '/checkout',
    '/payment',
    '/admin/:path*',
    '/api/admin/:path*'
  ],
}