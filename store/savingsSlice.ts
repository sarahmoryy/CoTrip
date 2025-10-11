// store/savingsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SavingsService } from './savingsService'; // ⬅️ ensure this path is correct


export interface SavingsRecord {
  id: string;
  amount: number;
  description?: string;
  month: string; // prefer "YYYY-MM" if possible
}

interface SavingsState {
  records: SavingsRecord[];
  totalSaved: number;
  loading?: boolean;
  error?: string | null;
}

const initialState: SavingsState = {
  records: [],
  totalSaved: 0,
  loading: false,
  error: null,
};

const savingsSlice = createSlice({
  name: 'savings',
  initialState,
  reducers: {
    setSavings: (state, action: PayloadAction<SavingsRecord[]>) => {
      state.records = action.payload;
      state.totalSaved = action.payload.reduce((sum, r) => sum + (r.amount || 0), 0);
    },
    addSavings: (state, action: PayloadAction<SavingsRecord>) => {
      state.records.push(action.payload);
      state.totalSaved += action.payload.amount || 0;
    },
    updateSavings: (state, action: PayloadAction<{ id: string; updates: Partial<SavingsRecord> }>) => {
      const i = state.records.findIndex(r => r.id === action.payload.id);
      if (i !== -1) {
        const oldAmt = state.records[i].amount || 0;
        state.records[i] = { ...state.records[i], ...action.payload.updates };
        state.totalSaved += (state.records[i].amount || 0) - oldAmt;
      }
    },
    deleteSavings: (state, action: PayloadAction<string>) => {
      const i = state.records.findIndex(r => r.id === action.payload);
      if (i !== -1) {
        state.totalSaved -= state.records[i].amount || 0;
        state.records.splice(i, 1);
      }
    },
    clearSavings: (state) => {
      state.records = [];
      state.totalSaved = 0;
    },
    setSavingsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSavingsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSavings, addSavings, updateSavings, deleteSavings, clearSavings,
  setSavingsLoading, setSavingsError,
} = savingsSlice.actions;

export default savingsSlice.reducer;

/* -------------------- Async thunk -------------------- */
export const fetchSavings =
  (sort: string = '-month', limit?: number) =>
  async (dispatch: any) => {
    try {
      dispatch(setSavingsLoading(true));
      dispatch(setSavingsError(null));
      const rows = await SavingsService.list(sort, limit);
      dispatch(setSavings(rows));
    } catch (e: any) {
      console.error('Failed to fetch savings:', e);
      dispatch(setSavingsError(e?.message ?? 'Failed to fetch savings'));
    } finally {
      dispatch(setSavingsLoading(false));
    }
  };

/* -------------------- Selectors -------------------- */
export const selectSavings = (s: any) => s.savings.records as SavingsRecord[];
export const selectTotalSaved = (s: any) => s.savings.totalSaved as number;

// Group by month (YYYY-MM preferred), sorted chronological
export const selectMonthlyBuckets = (s: any) => {
  const rows: SavingsRecord[] = s.savings.records ?? [];
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = typeof r.month === 'string' && r.month ? r.month : 'Unknown';
    map.set(key, (map.get(key) || 0) + (r.amount || 0));
  }
  const entries = Array.from(map.entries()).sort(([a], [b]) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return a.localeCompare(b);
  });
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return { entries, max };
};
