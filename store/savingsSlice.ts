import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SavingsRecord {
  id: string;
  amount: number;
  description?: string;
  month: string;
}

interface SavingsState {
  records: SavingsRecord[];
  totalSaved: number;
}

const initialState: SavingsState = {
  records: [],
  totalSaved: 0,
};

const savingsSlice = createSlice({
  name: 'savings',
  initialState,
  reducers: {
    setSavings: (state, action: PayloadAction<SavingsRecord[]>) => {
      state.records = action.payload;
      state.totalSaved = action.payload.reduce((sum, record) => sum + (record.amount || 0), 0);
    },
    addSavings: (state, action: PayloadAction<SavingsRecord>) => {
      state.records.push(action.payload);
      state.totalSaved += action.payload.amount || 0;
    },
    updateSavings: (state, action: PayloadAction<{ id: string; updates: Partial<SavingsRecord> }>) => {
      const index = state.records.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        const oldAmount = state.records[index].amount || 0;
        state.records[index] = { ...state.records[index], ...action.payload.updates };
        state.totalSaved += (state.records[index].amount || 0) - oldAmount;
      }
    },
    deleteSavings: (state, action: PayloadAction<string>) => {
      const index = state.records.findIndex(record => record.id === action.payload);
      if (index !== -1) {
        state.totalSaved -= state.records[index].amount || 0;
        state.records.splice(index, 1);
      }
    },
    clearSavings: (state) => {
      state.records = [];
      state.totalSaved = 0;
    },
  },
});

export const { setSavings, addSavings, updateSavings, deleteSavings, clearSavings } = savingsSlice.actions;
export default savingsSlice.reducer;