import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import inventoryReducer from './features/inventorySlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        inventory: inventoryReducer,
    },
});
