// src/features/attendance/attendanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

/**
 * Attendance slice - includes both employee and manager thunks.
 */

const initialState = {
  // employee
  today: null,
  history: [],
  summary: null,

  // manager
  all: { page: 1, limit: 20, data: [] },
  employeeAttendance: [],
  teamSummary: null,
  todayList: [],

  // generic
  status: 'idle',
  error: null,
};

// ---------- Employee thunks ----------
export const checkIn = createAsyncThunk('attendance/checkIn', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/attendance/checkin');
    return res.data;
  } catch (err) { return rejectWithValue(err); }
});

export const checkOut = createAsyncThunk('attendance/checkOut', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/attendance/checkout');
    return res.data;
  } catch (err) { return rejectWithValue(err); }
});

export const getMyHistory = createAsyncThunk('attendance/getMyHistory', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/attendance/my-history', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err); }
});

export const getMySummary = createAsyncThunk('attendance/getMySummary', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/attendance/my-summary', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err); }
});

export const getToday = createAsyncThunk('attendance/getToday', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/attendance/today');
    return res.data;
  } catch (err) { return rejectWithValue(err); }
});

// ---------- Manager thunks ----------
export const getAllEmployeesAttendance = createAsyncThunk(
  'attendance/getAllEmployeesAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/attendance/all', { params });
      return res.data;
    } catch (err) { return rejectWithValue(err); }
  }
);

export const getEmployeeAttendance = createAsyncThunk(
  'attendance/getEmployeeAttendance',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/attendance/employee/${id}`);
      return res.data;
    } catch (err) { return rejectWithValue(err); }
  }
);

export const getTeamSummary = createAsyncThunk(
  'attendance/getTeamSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/attendance/summary', { params });
      return res.data;
    } catch (err) { return rejectWithValue(err); }
  }
);

export const getTodayStatus = createAsyncThunk(
  'attendance/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/attendance/today-status');
      return res.data;
    } catch (err) { return rejectWithValue(err); }
  }
);

export const exportAttendanceCsv = createAsyncThunk(
  'attendance/exportAttendanceCsv',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/attendance/export', { params, responseType: 'blob' });
      return res.data;
    } catch (err) { return rejectWithValue(err); }
  }
);

// ---------- Slice ----------
const slice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError(state) { state.error = null; }
  },
  extraReducers: (builder) => {
    // employee
    builder.addCase(checkIn.fulfilled, (s, a) => { s.today = a.payload; s.status = 'succeeded'; });
    builder.addCase(checkIn.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload || a.error?.message; });

    builder.addCase(checkOut.fulfilled, (s, a) => { s.today = a.payload; s.status = 'succeeded'; });
    builder.addCase(checkOut.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload || a.error?.message; });

    builder.addCase(getMyHistory.fulfilled, (s, a) => { s.history = a.payload || []; });
    builder.addCase(getMyHistory.rejected, (s, a) => { s.error = a.payload || a.error?.message; });

    builder.addCase(getMySummary.fulfilled, (s, a) => { s.summary = a.payload || {}; });
    builder.addCase(getMySummary.rejected, (s, a) => { s.error = a.payload || a.error?.message; });

    builder.addCase(getToday.fulfilled, (s, a) => { s.today = a.payload || null; });
    builder.addCase(getToday.rejected, (s, a) => { s.error = a.payload || a.error?.message; });

    // manager
    builder.addCase(getAllEmployeesAttendance.fulfilled, (s, a) => { s.all = a.payload || { page:1, limit:20, data:[] }; });
    builder.addCase(getAllEmployeesAttendance.rejected, (s, a) => { s.error = a.payload || a.error?.message; });

    builder.addCase(getEmployeeAttendance.fulfilled, (s, a) => { s.employeeAttendance = a.payload || []; });
    builder.addCase(getEmployeeAttendance.rejected, (s, a) => { s.error = a.payload || a.error?.message; });

    builder.addCase(getTeamSummary.fulfilled, (s, a) => { s.teamSummary = a.payload || null; });
    builder.addCase(getTeamSummary.rejected, (s, a) => { s.error = a.payload || a.error?.message; });

    builder.addCase(getTodayStatus.fulfilled, (s, a) => { s.todayList = a.payload || []; });
    builder.addCase(getTodayStatus.rejected, (s, a) => { s.error = a.payload || a.error?.message; });

    builder.addCase(exportAttendanceCsv.fulfilled, (s, a) => { /* blob handled by component */ });
    builder.addCase(exportAttendanceCsv.rejected, (s, a) => { s.error = a.payload || a.error?.message; });
  }
});

export const { clearAttendanceError } = slice.actions;
export default slice.reducer;