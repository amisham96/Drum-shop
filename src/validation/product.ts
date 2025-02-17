/**
 * File: product.ts
 * Description: this file consists of schemas to validate
 * product data
*/

import { z } from 'zod';

const variantFieldSchema = z.object({
  color: z.array(z.string()).optional(),
  size: z.array(z.string()).optional(),
  material: z.array(z.string()).optional(),
});

const groupItemSchema = z.object({
  color: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  quantity: z.number(),
  price: z.number(),
});

const groupFieldSchema = z.array(groupItemSchema).optional();

const AddProductValidationSchema = z.object({
  name: z.string({
      required_error: 'Product name is required',
    })
    .trim()
    .min(1, {message: 'Product name can\'t be empty'})
    .max(150, {message: 'Product name can\'t exceed 150 characters'}),
  category: z.string({
      required_error: 'Product category is required',  
    })
    .trim()
    .min(1, {message: 'Product category can\'t be empty'})
    .max(50, {message: 'Product category can\'t exceed 50 character'}),  
  brand: z.string({
      required_error: 'Product brand is required',  
    })
    .trim()
    .min(1, {message: 'Product brand can\'t be empty'})
    .max(50, {message: 'Product brand can\'t exceed 50 character'}),
  
  model: z.string({
      required_error: 'Product model is required',  
    })
    .trim()
    .min(1, {message: 'Product model can\'t be empty'}),

  costPrice: z.number().min(0, 'Cost price can\'t be negative'),  
  sellingPrice: z.number().min(0, 'Selling price can\'t be negative'),  
  cgst: z.number().min(0, 'CGST can\'t be negative'),  
  sgst: z.number().min(0, 'SGST can\'t be negative'),  
  discount: z.number(),  
  quantity: z.number().min(0, 'Quantity can\'t be negative'),  
  hsnCode: z.number({
      required_error: 'HSN code can\'t be empty',
    }),  
  
  description: z.string({
      required_error: 'Product description is required'
    })
    .trim()
    .min(1, {message: 'Product description can\'t be empty'}),
  specification: z.string({
      required_error: 'Specification can\'t be empty'
    })
    .trim()
    .min(1, {message: 'Product specification can\'t be empty'}),
  
  variants: variantFieldSchema,
  groups: groupFieldSchema,
});

export {
  AddProductValidationSchema,
}
