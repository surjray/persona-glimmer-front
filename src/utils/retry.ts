interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  retryable?: (error: any) => boolean;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    retryable = (error) => {
      // Retry on network errors, timeouts, or 5xx errors
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        return true;
      }
      if (error.name === 'AbortError') {
        return true; // Timeout errors
      }
      if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503') || error.message?.includes('504')) {
        return true;
      }
      // CORS errors might indicate backend is down
      if (error.message?.includes('CORS')) {
        return true;
      }
      return false;
    },
  } = options;

  let lastError: any;
  let currentDelay = delay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === maxRetries || !retryable(error)) {
        throw error;
      }

      // Wait before retrying
      if (backoff) {
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= 2; // Exponential backoff
      } else {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
