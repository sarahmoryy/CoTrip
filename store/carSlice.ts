import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Car {
  id: string; // include unique id
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  consumption_l_100km?: number;
  fuel_efficiency?: number;
  [key: string]: string | number | undefined; // Index signature for dynamic access
}

interface CarState {
  cars: Car[];
}

const initialState: CarState = {
  cars: [],
};

const carSlice = createSlice({
  name: 'car',
  initialState,
  reducers: {
    addCar: (state, action: PayloadAction<Car>) => {
      state.cars.push(action.payload);
    },
    removeCar: (state, action: PayloadAction<string>) => {
      state.cars = state.cars.filter((car) => car.id !== action.payload);
    },
    clearCars: (state) => {
      state.cars = [];
    },
    setCars: (state, action: PayloadAction<Car[]>) => {
      state.cars = action.payload; // Replace the entire cars array with new data
    },
  },
});

export const { addCar, removeCar, clearCars, setCars } = carSlice.actions;
export default carSlice.reducer;