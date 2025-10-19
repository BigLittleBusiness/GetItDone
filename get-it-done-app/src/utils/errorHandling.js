/**
 * Error handling utilities for consistent error management across the app
 */

/**
 * Extract user-friendly error message from API error
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Network error
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Network error. Please check your internet connection.';
  }
  
  // API error with message
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // HTTP status errors
  const status = error.response?.status;
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication failed. Please sign in again.';
    case 403:
      return 'You don\'t have permission to do this.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This action conflicts with existing data.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export const logError = (error, context = {}) => {
  console.error('[Error]', {
    message: error.message,
    stack: error.stack,
    response: error.response?.data,
    status: error.response?.status,
    ...context,
  });
  
  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
};

/**
 * Handle async errors with try-catch wrapper
 */
export const withErrorHandling = (asyncFn, errorCallback) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      logError(error, { function: asyncFn.name });
      if (errorCallback) {
        errorCallback(error);
      }
      throw error;
    }
  };
};

/**
 * Retry failed requests with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === maxRetries - 1;
      const isRetryable = error.code === 'ERR_NETWORK' || error.response?.status >= 500;
      
      if (isLastAttempt || !isRetryable) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

