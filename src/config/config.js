// API URL - defaults to localhost for development
export const API_URL = import.meta.env.VITE_API_URL || "https://localhost:8000/api";

// Application name
export const APP_NAME = import.meta.env.VITE_APP_NAME || "Toubib";

// UI Configuration
export const MESSAGE_TIMEOUT = parseInt(import.meta.env.VITE_MESSAGE_TIMEOUT) || 3000;
export const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || "€";
