import { z } from 'zod';
import type { ParticipantStatus } from '@/types';

export const participantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  register_number: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  status: z.enum(['participated', '1st', '2nd', '3rd'], {
    error: 'Status must be participated, 1st, 2nd, or 3rd',
  }),
}).refine(
  (row) => (row.register_number && row.register_number.trim() !== '') || (row.email && row.email.trim() !== ''),
  { message: 'Each row needs register_number or email' }
);

export type ParticipantFormData = z.infer<typeof participantSchema>;

/** Normalise various status string inputs to canonical ParticipantStatus */
export function normaliseStatus(raw: string): ParticipantStatus | null {
  const s = raw.trim().toLowerCase();
  const map: Record<string, ParticipantStatus> = {
    'participated': 'participated',
    'participant': 'participated',
    'present': 'participated',
    '1st': '1st',
    '1': '1st',
    'first': '1st',
    '1st place': '1st',
    'winner': '1st',
    'gold': '1st',
    '2nd': '2nd',
    '2': '2nd',
    'second': '2nd',
    '2nd place': '2nd',
    'silver': '2nd',
    '3rd': '3rd',
    '3': '3rd',
    'third': '3rd',
    '3rd place': '3rd',
    'bronze': '3rd',
  };
  return map[s] ?? null;
}

/** Map raw column headers to normalised field names */
export function normaliseColumnName(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    'name': 'name',
    'student name': 'name',
    'full name': 'name',
    'register number': 'register_number',
    'reg no': 'register_number',
    'roll no': 'register_number',
    'registration': 'register_number',
    'reg number': 'register_number',
    'email': 'email',
    'email id': 'email',
    'mail': 'email',
    'mail id': 'email',
    'status': 'status',
    'result': 'status',
    'reg.no': 'register_number',
    'register no': 'register_number',
    'position': 'status'
  };
  return map[s] ?? null;
}
