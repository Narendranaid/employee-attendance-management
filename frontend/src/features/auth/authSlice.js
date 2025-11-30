// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', payload);
    return res.data; // { user, token }
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err);
  }
});

export const loadMe = createAsyncThunk('auth/loadMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
    },
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.status = 'succeeded';
        localStorage.setItem('token', a.payload.token);
      })
      .addCase(login.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload || a.error.message; })

      .addCase(register.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(register.fulfilled, (s, a) => {
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.status = 'succeeded';
        localStorage.setItem('token', a.payload.token);
      })
      .addCase(register.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload || a.error.message; })

      .addCase(loadMe.fulfilled, (s, a) => { s.user = a.payload; s.status = 'succeeded'; })
      .addCase(loadMe.rejected, (s) => { s.user = null; s.status = 'idle'; });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;