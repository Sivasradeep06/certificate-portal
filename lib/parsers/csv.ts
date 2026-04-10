import Papa from 'papaparse';
import { normaliseColumnName, normaliseStatus } from '@/lib/validators/participant';
import type { CsvRow } from '@/types';

export interface ParseResult {
  rows: CsvRow[];
  errors: Array<{ row: number; message: string; data: Record<string, string> }>;
}

/** Parse a CSV file and normalise columns + status values */
export function parseCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const parsed = processRows(results.data as Record<string, string>[]);
        resolve(parsed);
      },
      error(err) {
        reject(new Error(`CSV parse error: ${err.message}`));
      },
    });
  });
}

function processRows(rawRows: Record<string, string>[]): ParseResult {
  const rows: CsvRow[] = [];
  const errors: ParseResult['errors'] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i];
    const normalised: Record<string, string> = {};

    for (const [key, value] of Object.entries(raw)) {
      const normKey = normaliseColumnName(key);
      if (normKey) {
        normalised[normKey] = value?.trim() ?? '';
      }
    }

    if (!normalised.name) {
      errors.push({ row: i + 2, message: 'Missing name column', data: raw });
      continue;
    }

    if (!normalised.status) {
      errors.push({ row: i + 2, message: 'Missing status column', data: raw });
      continue;
    }

    const status = normaliseStatus(normalised.status);
    if (!status) {
      errors.push({
        row: i + 2,
        message: `Invalid status: "${normalised.status}"`,
        data: raw,
      });
      continue;
    }

    if (!normalised.register_number && !normalised.email) {
      errors.push({
        row: i + 2,
        message: 'Each row needs register_number or email',
        data: raw,
      });
      continue;
    }

    rows.push({
      name: normalised.name,
      register_number: normalised.register_number || undefined,
      email: normalised.email || undefined,
      status,
    });
  }

  return { rows, errors };
}
