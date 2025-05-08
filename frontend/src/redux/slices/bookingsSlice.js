import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hairArtistService } from '../../api/services/hairArtistService';

// Helper function to merge date ranges
const mergeDateRanges = (ranges, newRange) => {
  if (ranges.length === 0) return [newRange];
  
  // Sort ranges by start date
  const sortedRanges = [...ranges].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  
  const result = [];
  let current = sortedRanges[0];
  
  // Process existing ranges
  for (let i = 1; i < sortedRanges.length; i++) {
    const next = sortedRanges[i];
    
    // Check if ranges overlap or are adjacent
    if (new Date(current.end) >= new Date(next.start) || 
        new Date(current.end).getTime() + 86400000 >= new Date(next.start).getTime()) {
      // Merge overlapping ranges
      current = {
        start: current.start,
        end: new Date(current.end) > new Date(next.end) ? current.end : next.end
      };
    } else {
      // Add non-overlapping range to result
      result.push(current);
      current = next;
    }
  }
  
  // Add the last processed range
  result.push(current);
  
  // Now merge the new range with the result
  for (let i = 0; i < result.length; i++) {
    const range = result[i];
    
    // Check if the new range overlaps with this range
    if (new Date(newRange.end) >= new Date(range.start) && 
        new Date(newRange.start) <= new Date(range.end)) {
      // Merge them
      result[i] = {
        start: new Date(newRange.start) < new Date(range.start) ? newRange.start : range.start,
        end: new Date(newRange.end) > new Date(range.end) ? newRange.end : range.end
      };
      return result;
    }
    
    // Check if the new range comes before this range
    if (new Date(newRange.end) < new Date(range.start)) {
      return [...result.slice(0, i), newRange, ...result.slice(i)];
    }
  }
  
  // If we get here, the new range comes after all existing ranges
  return [...result, newRange];
};

// Async thunks
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async ({ date, startDate, endDate }, { rejectWithValue, getState }) => {
    try {
      const response = await hairArtistService.getBookings(date, startDate, endDate);
      
      // We'll implement date range caching logic here in the future
      if (startDate && endDate) {
        // Removed the unused 'newRange' variable
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch bookings');
    }
  }
);

export const fetchServices = createAsyncThunk(
  'bookings/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hairArtistService.getServices();
      return response;
    } catch (error) {
      console.error('Error fetching services:', error);
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch services');
    }
  }
);

// Initial state
const initialState = {
  bookings: [],
  services: [],
  cachedDateRanges: [],
  loading: false,
  error: null,
  lastFetchTime: null
};

// Bookings slice
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookingsError: (state) => {
      state.error = null;
    },
    addDateRange: (state, action) => {
      state.cachedDateRanges = mergeDateRanges(state.cachedDateRanges, action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
        state.lastFetchTime = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bookings';
      })
      
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
        state.error = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch services';
      });
  }
});

export const { clearBookingsError, addDateRange } = bookingsSlice.actions;

export default bookingsSlice.reducer;
