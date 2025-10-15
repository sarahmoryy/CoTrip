// store/carSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CarService } from './carService'; // ⬅️ ensure this path is correct

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  consumption_l_100km?: number;
  fuel_efficiency?: number;
  [key: string]: string | number | undefined;
}

interface CarState {
  cars: Car[];
}

const initialState: CarState = { cars: [] };

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
      state.cars = action.payload;
    },
  },
});

export const { addCar, removeCar, clearCars, setCars } = carSlice.actions;
export default carSlice.reducer;

/* -------------------- Async thunks -------------------- */
// Minimal thunk to fetch all cars for the signed-in user
export const fetchCars =
  () => async (dispatch: any) => {
    try {
      const cars = await CarService.list('-createdAt');
      dispatch(setCars(cars));
    } catch (e) {
      // optional: add a toast/log here
      console.error('Failed to fetch cars:', e);
    }
  };

// Optional helpers if you want async create/update/delete:
export const createCar =
  (car: Car) => async (dispatch: any) => {
    const created = await CarService.create(car);
    dispatch(addCar(created));
  };

export const updateCar =
  (id: string, patch: Partial<Car>) => async () => {
    await CarService.update(id, patch);
  };

export const deleteCar =
  (id: string) => async (dispatch: any) => {
    await CarService.delete(id);
    dispatch(removeCar(id));
  };
