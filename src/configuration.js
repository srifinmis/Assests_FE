// configuration.js

// API Configuration
const API_CONFIG = {
    APIURL: 'http://localhost:2727/api', // Asset API
  };
  
  // Refresh Intervals and Timeouts
  const REFRESH_CONFIG = {
    DROPDOWN_REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes in milliseconds
  };
  
  // UI Configuration (if any UI-related settings are needed)
  const UI_CONFIG = {
    BASE_UI_URL: 'http://localhost:3333', // UI base URL
  };
  
  module.exports = { API_CONFIG, REFRESH_CONFIG, UI_CONFIG };
  