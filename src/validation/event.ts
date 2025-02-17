/**
 * File: event.ts
 * Description: this file consists of schemas to validate
 * event data
*/

import { z } from 'zod';

const featuredArtistSchema = z.object({
  name: z.string({
      required_error: 'Artist name can\'t be empty'
    }).trim(),
  link: z.string().trim().nullable().optional(),
  title: z.string().trim().nullable().optional(),
});

const AddEventValidationSchema = z.object({
  name: z.string({
      required_error: 'Event name is required',
    })
    .trim()
    .min(1, {message: 'Event name can\'t be empty'})
    .max(150, {message: 'Event name can\'t exceed 150 characters'}),
  location: z.string({
      required_error: 'Event location is required',
    })
    .trim()
    .min(1, {message: 'Event location can\'t be empty'})
    .max(150, {message: 'Event location can\'t exceed 150 characters'}),
  date: z.string({
      required_error: 'Event date is required',
    })
    .date(),
  time: z.string({
      required_error: 'Event time is required',
    })
    .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/),
  details: z.string({
      required_error: 'Event details is required',
    })
    .trim()
    .min(1, {message: 'Event details can\'t be empty'}),
  socialLinks: z.object({
    instagram: z.string().trim().nullable().optional(),
    facebook: z.string().trim().nullable().optional(),
    youtube: z.string().trim().nullable().optional(),
    x: z.string().trim().nullable().optional(),
  }),
  featuredArtists: z.array(featuredArtistSchema).optional(),
  featuredProducts: z.array(z.string()).optional(),
  status: z.enum(['ongoing', 'expired', 'highlights']),
});

export {
  AddEventValidationSchema,
}
