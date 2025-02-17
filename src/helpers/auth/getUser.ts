/*
  File: getUser.ts
  Description: this file contains function to retrieve a authenticated
  user's info using server-side fetch
*/

'use server';

import { cache } from 'react';
import { cookies } from 'next/headers';

type UserDataType = {
  user: {
    userId: string,
    email: string,
  },
  cart: {
    cartId: string,
    productCount: number,
  }
}

async function getAuthenticatedUser(): Promise<UserDataType | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
      cache: 'no-store',
      headers: { 
        // cookie should be added while using server-side fetch
        Cookie: cookies().toString()
      },
    });
    const {user, cart} = await res.json();

    if (user) {
      return {user, cart};
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

const getUser = cache(getAuthenticatedUser);

export {
  getAuthenticatedUser,
  getUser,
  type UserDataType as UserType,
}
