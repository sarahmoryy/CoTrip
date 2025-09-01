import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

const initialState: UserState = {
  full_name: '',
  email: '',
  phone: '',
  address: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.full_name = action.payload.full_name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.address = action.payload.address;
    },
    clearUser: (state) => {
      state.full_name = '';
      state.email = '';
      state.phone = '';
      state.address = '';
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;