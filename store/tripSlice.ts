import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the Trip interface
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

// Define valid sort keys for Trip
type TripSortKey = keyof Trip;

interface TripState {
  trips: Trip[];
}

const initialState: TripState = {
  trips: [],
};

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