import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const { authApi } = require('@/services/api'); // Dynamic import to avoid cycles or ensure loading
            const res = await authApi.login(credentials);
            // Save token
            localStorage.setItem('token', res.data.token);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Login failed');
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
        switchOutlet: (state, action) => {
            if (state.user) {
                state.user.outletId = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(login.fulfilled, (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        });
    }
});

export const { logout, switchOutlet } = authSlice.actions;

export default authSlice.reducer;
