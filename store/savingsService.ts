// store/SavingsService.ts
import { SavingsRecord } from './savingsSlice';

function parseMaybeDate(v: any): number | null {
  if (!v) return null;
  // support YYYY-MM as month, e.g. "2025-10"
  if (typeof v === 'string' && /^\d{4}-\d{2}$/.test(v)) {
    const [y, m] = v.split('-').map(Number);
    return new Date(y, m - 1, 1).getTime();
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.getTime();
}

function compareValues(a: any, b: any, desc = false) {
  // try number
  const an = typeof a === 'number' ? a : Number(a);
  const bn = typeof b === 'number' ? b : Number(b);
  if (!Number.isNaN(an) && !Number.isNaN(bn)) {
    return desc ? bn - an : an - bn;
  }
  // try date
  const ad = parseMaybeDate(a);
  const bd = parseMaybeDate(b);
  if (ad !== null && bd !== null) {
    return desc ? bd - ad : ad - bd;
  }
  // fallback string
  const as = String(a ?? '');
  const bs = String(b ?? '');
  return desc ? bs.localeCompare(as) : as.localeCompare(bs);
}

export class SavingsService {
  static async list(sort?: string, limit?: number): Promise<SavingsRecord[]> {
    const response = await fetch('https://your-api-endpoint/savings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch savings');
    const data = await response.json();

    // Normalize + coerce
    let rows: SavingsRecord[] = data.map((s: any) => ({
      id: String(s.id),
      amount: Number(s.amount) || 0,
      description: s.description ?? undefined,
      month: s.month ?? s.createdAt ?? s.date ?? '', // we’ll format later
    }));

    if (sort) {
      const key = sort.replace('-', '');
      const desc = sort.startsWith('-');
      rows.sort((a: any, b: any) => compareValues(a[key], b[key], desc));
    }

    if (typeof limit === 'number') rows = rows.slice(0, limit);
    return rows;
  }
}

export default SavingsService;
