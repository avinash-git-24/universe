/**
 * Retries an asynchronous function with exponential backoff.
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delayMs?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const { retries = 3, delayMs = 500, backoffFactor = 2 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        const waitTime = delayMs * Math.pow(backoffFactor, attempt);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

/**
 * Safely executes a promise without throwing, returning a tuple [data, error].
 */
export async function safeAsync<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return [null, err];
  }
}
