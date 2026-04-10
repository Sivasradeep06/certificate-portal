import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(200, 'Event name too long'),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  event_date: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const eventUpdateSchema = eventSchema.partial();

export type EventFormData = z.infer<typeof eventSchema>;
