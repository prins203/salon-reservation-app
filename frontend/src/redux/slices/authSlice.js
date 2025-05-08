import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hairArtistService } from '../../api/services/hairArtistService';

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const tokenResponse = await hairArtistService.login(email, password);
      localStorage.setItem('token', tokenResponse.access_token);
      const user = await hairArtistService.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await hairArtistService.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    return null;
  }
);

// Initial state
const initialState = {
  currentUser: null,
  loading: false,
  authenticated: false,
  error: null
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.authenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.authenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.authenticated = false;
        state.currentUser = null;
        state.error = action.payload || 'Failed to fetch user';
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.authenticated = false;
        state.error = null;
      });
  }
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
