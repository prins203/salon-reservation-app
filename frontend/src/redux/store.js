import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookingsReducer from './slices/bookingsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    bookings: bookingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['bookings/addDateRange'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.start', 'payload.end'],
        // Ignore these paths in the state
        ignoredPaths: ['bookings.cachedDateRanges'],
      },
    }),
});

export default store;
