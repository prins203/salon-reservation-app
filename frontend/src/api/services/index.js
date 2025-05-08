// Simple direct exports to avoid circular dependencies

// Re-export everything from serviceApi.js
export { serviceApi } from './serviceApi';

// Export from old-style service files for backward compatibility
export { bookingService } from './bookingService';
export { hairArtistService } from './hairArtistService';

// Export our new modular services directly
export { default as authService } from './auth/authService';

// For components that import directly from the old paths, we'll maintain
// the original files but have them import from these modules instead 