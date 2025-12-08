// src/services/axiosInstance.js
const axios = require('axios');
const axiosRetry = require('axios-retry').default;

// Create an Axios instance
const axiosInstance = axios.create();

// Add retry logic to the instance
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => {
    console.log(`🔁 Retry attempt #${retryCount}`);
    return retryCount * 1000;
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
  }
});

module.exports = axiosInstance;