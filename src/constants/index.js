// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// App Configuration
export const APP_NAME = 'Game Library';
export const APP_VERSION = '1.0.0';

// Pagination
export const ITEMS_PER_PAGE = 12;

// Routes
export const ROUTES = {
  HOME: '/',
  GAMES: '/games',
  ABOUT: '/about',
};
