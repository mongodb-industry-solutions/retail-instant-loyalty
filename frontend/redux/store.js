import { configureStore } from '@reduxjs/toolkit';
import GlobalReducer from './slices/GlobalSlice.js';

const store = configureStore({
    reducer: {
        "Global": GlobalReducer,
    }
});

export default store;
