// store/tripSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TripService } from './tripService'; // ⬅️ ensure this path is correct

export interface Trip {
  id: string;
  destination: string;
  date: string;
  from_location_name?: string;
  to_location_name?: string;
  from_location?: string;
  to_location?: string;
  passengers?: string;
  car_id?: string;
  cost?: number;
  savings?: number;
  distance?: number;
}
type TripSortKey = keyof Trip;

interface TripState {
  trips: Trip[];
}

const initialState: TripState = { trips: [] };

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setTrips: (state, action: PayloadAction<Trip[]>) => {
      state.trips = action.payload;
    },
    addTrip: (state, action: PayloadAction<Trip>) => {
      state.trips.push(action.payload);
    },
    updateTrip: (state, action: PayloadAction<{ id: string; tripData: Partial<Trip> }>) => {
      const index = state.trips.findIndex((trip) => trip.id === action.payload.id);
      if (index !== -1) {
        state.trips[index] = { ...state.trips[index], ...action.payload.tripData };
      }
    },
    deleteTrip: (state, action: PayloadAction<string>) => {
      state.trips = state.trips.filter((trip) => trip.id !== action.payload);
    },
    clearTrips: (state) => {
      state.trips = [];
    },
  },
});

export const { setTrips, addTrip, updateTrip, deleteTrip, clearTrips } = tripSlice.actions;
export default tripSlice.reducer;

/* -------------------- Async thunks -------------------- */
export const fetchTrips =
  () => async (dispatch: any) => {
    try {
      const trips = await TripService.list('-createdAt');
      dispatch(setTrips(trips));
    } catch (e) {
      console.error('Failed to fetch trips:', e);
    }
  };

export const createTrip =
  (trip: Trip) => async (dispatch: any) => {
    const created = await TripService.create(trip);
    dispatch(addTrip(created));
  };

export const patchTrip =
  (id: string, patch: Partial<Trip>) => async (dispatch: any) => {
    await TripService.update(id, patch);
    dispatch(updateTrip({ id, tripData: patch }));
  };

export const removeTrip =
  (id: string) => async (dispatch: any) => {
    await TripService.delete(id);
    dispatch(deleteTrip(id));
  };

  // All trips
export const selectTrips = (s: any) => (s.trip?.trips ?? []) as Trip[];

// Total savings across all trips
export const selectTotalSavingsFromTrips = (s: any) =>
  selectTrips(s).reduce((sum: number, t: Trip) => sum + (t.savings ?? 0), 0);

// Monthly savings grouped by trip.date (expects a parsable date string)
export const selectMonthlySavingsFromTrips = (s: any) => {
  const trips: Trip[] = selectTrips(s);
  const map = new Map<string, number>();

  const toMonthKey = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Unknown';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`; // e.g., "2025-10"
  };

  for (const t of trips) {
    const key = toMonthKey(t.date);
    map.set(key, (map.get(key) ?? 0) + (t.savings ?? 0));
  }

  // Sort chronologically; keep 'Unknown' last
  const entries = Array.from(map.entries()).sort(([a], [b]) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return a.localeCompare(b);
  });

  const max = Math.max(1, ...entries.map(([, v]) => v));
  return { entries, max };
};
