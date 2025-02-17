import { z } from 'zod';

const ShippingAddressSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name can\'t be empty' })
    .max(50, { message: 'Name can\'t exceed 50 characters' }),
  phone: z
    .string()
    .min(1, { message: 'Phone number can\'t be empty' })
    .max(10, { message: 'Phone number can\'t exceed 10 characters' }),
  address: z
    .string()
    .min(1, { message: 'Address can\'t be empty' })
    .max(300, { message: 'Address can\'t exceed 300 characters' }),
  city: z
    .string()
    .min(1, { message: 'City can\'t be empty' })
    .max(50, { message: 'City can\'t exceed 50 characters' }),
  pinCode: z
    .string()
    .min(1, { message: 'Pin code can\'t be empty' })
    .max(6, { message: 'Pin code can\'t exceed 6 characters' }),
  state: z
    .string()
    .min(1, { message: 'State can\'t be empty' }),
  landmark: z.string().optional(),
  addressType: z.string().optional(),
});

export default ShippingAddressSchema;
