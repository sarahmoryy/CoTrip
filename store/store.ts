import { combineReducers, configureStore } from '@reduxjs/toolkit';
import carReducer from './carSlice';
import savingsReducer from './savingsSlice';
import tripReducer from './tripSlice';
import userReducer from './userSlice';

const rootReducer = combineReducers({
  car: carReducer,
  user: userReducer,
  trip: tripReducer,
  savings: savingsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
