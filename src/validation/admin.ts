import { z } from 'zod';

const AddAdminUserValidationSchema = z.object({
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
      required_error: 'Phone number is required',
    })
    .trim()
    .min(1, {message: 'Phone number can\'t be empty.'})
    .max(60, {message: 'Phone number can\'t exceed 10 characters.'}),
  password: z.string({required_error: 'Password is required.'})
    .trim()
    .min(8, {message: 'Password should be minimum 8 characters'}),
  privilege: z.string({required_error: 'Privilege can\'t be empty'})
    .trim()
});

const EditAdminUserValidationSchema = z.object({
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
      required_error: 'Phone number is required',
    })
    .trim()
    .min(1, {message: 'Phone number can\'t be empty.'})
    .max(60, {message: 'Phone number can\'t exceed 10 characters.'}),
  privilege: z.string({required_error: 'Privilege can\'t be empty'})
    .trim()
});

export {
  AddAdminUserValidationSchema,
  EditAdminUserValidationSchema,
}
