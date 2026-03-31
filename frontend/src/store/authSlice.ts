import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  username: string | null;
  roles: string[];
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  username: localStorage.getItem('username'),
  roles: JSON.parse(localStorage.getItem('roles') || '[]'),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; username: string; roles: string[] }>
    ) => {
      const { token, username, roles } = action.payload;
      state.token = token;
      state.username = username;
      state.roles = roles;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('roles', JSON.stringify(roles));
    },
    logout: (state) => {
      state.token = null;
      state.username = null;
      state.roles = [];
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('roles');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
