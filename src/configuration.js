// configuration.js

// API Configuration
const API_CONFIG = {
    APIURL: 'http://192.168.80.38:2727/api',
  };

// const API_CONFIG = {
//   APIURL: 'http://localhost:2730/api',  
// };

// Refresh Intervals and Timeouts
const REFRESH_CONFIG = {
  DROPDOWN_REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes in milliseconds
};

// UI Configuration (if any UI-related settings are needed)
const UI_CONFIG = {
  BASE_UI_URL: 'http://192.168.80.38:3333', // UI base URL
};

module.exports = { API_CONFIG, REFRESH_CONFIG, UI_CONFIG };
