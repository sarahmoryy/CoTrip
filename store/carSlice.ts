// store/carSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toMillis } from "../assets/utils/conversion";
import { CarService } from "./carService";
import { clearUser } from "./userSlice"; // ← optional: wipe cars on logout

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number | null;
  license_plate?: string;
  consumption_l_100km?: number | null;
  fuel_efficiency?: number | null;
  createdAt?: number | null;
  updatedAt?: number | null;
  [key: string]: any;
}

interface CarState {
  cars: Car[];
}

const initialState: CarState = { cars: [] };

// ---- serializers ----
const toNumber = (n: any) =>
  typeof n === "number" ? n : typeof n === "string" ? Number(n) || 0 : 0;

const serializeCar = (c: any): Car => ({
  ...c,
  year: c?.year == null ? null : toNumber(c.year),
  fuel_efficiency: c?.fuel_efficiency == null ? null : toNumber(c.fuel_efficiency),
  consumption_l_100km:
    c?.consumption_l_100km == null ? null : toNumber(c.consumption_l_100km),
  createdAt: toMillis(c?.createdAt),
  updatedAt: toMillis(c?.updatedAt),
});

const serializeCars = (arr: any[]): Car[] => (arr ?? []).map(serializeCar);

// ---- slice ----
const carSlice = createSlice({
  name: "car",
  initialState,
  reducers: {
    setCars: {
      reducer(state, action: PayloadAction<Car[]>) {
        state.cars = action.payload;
      },
      prepare(cars: any[]) {
        return { payload: serializeCars(cars) };
      },
    },
    addCar: {
      reducer(state, action: PayloadAction<Car>) {
        state.cars.push(action.payload);
      },
      prepare(car: any) {
        return { payload: serializeCar(car) };
      },
    },
    updateCar: {
      reducer(state, action: PayloadAction<Car>) {
        const i = state.cars.findIndex((c) => c.id === action.payload.id);
        if (i >= 0) state.cars[i] = action.payload;
      },
      prepare(car: any) {
        return { payload: serializeCar(car) };
      },
    },
    removeCar(state, action: PayloadAction<string>) {
      state.cars = state.cars.filter((c) => c.id !== action.payload);
    },
    resetCars() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Optional safety: wipe cars on logout
    builder.addCase(clearUser, () => initialState);
  },
});

export const { setCars, addCar, updateCar, removeCar, resetCars } = carSlice.actions;
export default carSlice.reducer;

/* -------------------- Async thunks -------------------- */
export const fetchCars = () => async (dispatch: any) => {
  try {
    const cars = await CarService.list("-createdAt");
    dispatch(setCars(cars)); // prepare() serializes
  } catch (e) {
    console.error("Failed to fetch cars:", e);
  }
};

export const createCar = (car: Car) => async (dispatch: any) => {
  const created = await CarService.create(car);
  dispatch(addCar(created)); // prepare() serializes
};

export const patchCar =
  (id: string, patch: Partial<Car>) => async (dispatch: any, getState: any) => {
    await CarService.update(id, patch);
    // reflect in state (optional convenience)
    const curr = (getState().car.cars as Car[]).find((c) => c.id === id);
    if (curr) dispatch(updateCar({ ...curr, ...patch })); // prepare() serializes
  };

export const deleteCar =
  (id: string) => async (dispatch: any) => {
    await CarService.delete(id);
    dispatch(removeCar(id));
  };
