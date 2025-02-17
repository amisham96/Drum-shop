/*
  File: user.ts
  Description: this file contains schemas to validate user info
  while user registration and user login
*/

import { z } from 'zod';

// schema declared for the data validation
const getSignUpValidationSchema = (addPassword: boolean = true) => {
  /* dynamically make password optional/required
     by default, it is required
  */
  let passwordField = null;

  if (addPassword) {
    passwordField = z.string({required_error: 'Password is required.'})
                    .trim()
                    .min(8, {message: 'Password should be minimum 8 characters'});
  } else {
    passwordField = z.string().optional();
  }
  
  return z.object({
    fullName: z.string({
        required_error: 'Full name is required.'
      })
      .trim()
      .min(1, {message: 'Username can\'t be empty.'})
      .max(60, {message: 'Username can\'t exceed 60 characters.'}),
    email: z.string({
        required_error: 'Email is required.'
      })
      .trim()
      .email({message: 'Invalid email.'}),
    phone: z.string({
        required_error: 'Phone number is required.'
      })
      .trim()
      .max(10, {message: 'Phone number must be 10 digits.'})
      .refine(value => /^\d+$/.test(value), {
        message: 'Phone number must contain only digits.',
      }),
    password: passwordField,
  })
}

// schema declared for the data validation
const LoginValidationSchema = z.object({
  email: z.string({
      required_error: 'Email/Phone is required'
    })
    .trim()
    .min(1, {message: 'Email/Phone can\'t be empty'}),
  password: z.string({
      required_error: 'Password is required'
    })
    .trim()
    .min(8, {message: 'Password is of minimum 8 characters'}),
})

export {
  getSignUpValidationSchema,
  LoginValidationSchema,
}
