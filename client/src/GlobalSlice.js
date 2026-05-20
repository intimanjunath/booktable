import { combineReducers, createSlice } from '@reduxjs/toolkit';

const initialDataState = {
  role: sessionStorage.getItem('role') || '',
  isLoggedIn: sessionStorage.getItem('LoggedIn') === 'true',
};

const dataSlice = createSlice({
  name: 'global',
  initialState: initialDataState,
  reducers: {
    addItem: (state, action) => {
      state.role = action.payload;
    },
    login: (state, action) => {
      state.role = action.payload.role;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.role = '';
      state.isLoggedIn = false;
    },
  },
});

export const { addItem, login, logout } = dataSlice.actions;

const dataReducer = dataSlice.reducer;

const rootReducer = combineReducers({
  data: dataReducer,
});

export default rootReducer;
