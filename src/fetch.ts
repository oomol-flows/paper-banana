export interface ExtendedRequestInit extends RequestInit {
  /** Number of retries before failing. Default `5` */
  readonly maxAttempts?: number;
  /** Base seconds before each retry as exponential backoff capped at 30s. Default `5` */
  readonly retryDelay?: number;
}

export async function fetchWithRetry(input: string | URL | Request, init?: ExtendedRequestInit): Promise<Response> {
  const maxAttempts = init?.maxAttempts ?? 5;
  const retryDelay = init?.retryDelay ?? 5;

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(input, init);

      // 如果响应成功，直接返回
      if (response.ok) {
        return response;
      }

      const errorBody = await response.text().catch(() => '');
      const errorMessage = `HTTP ${response.status}: ${errorBody || response.statusText}`;
      lastError = new Error(errorMessage);

      // 不可重试的 4XX 客户端错误，直接抛出
      if (response.status >= 400 && response.status < 500) {
        // 429 Too Many Requests 可重试（通常有 Retry-After 头）
        // 408 Request Timeout 可重试
        if (response.status !== 429 && response.status !== 408) {
          throw lastError;
        }
      }

      // 5XX 服务器错误和其他可重试错误，继续重试
    } catch (error) {
      // 如果是我们主动抛出的不可重试错误，直接向上抛出
      if (error instanceof Error && error.message.startsWith('HTTP 4')) {
        throw error;
      }
      // 捕获网络错误等可重试错误
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // 如果不是最后一次尝试，等待后重试
    if (attempt < maxAttempts - 1) {
      const delay = Math.min(retryDelay * Math.pow(2, attempt), 30);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }
  }

  throw lastError;
}

export async function guardResponse(response: Response): Promise<void> {
  // fetchWithRetry 保证返回成功的 response，这里理论上是不会走到的，但是防呆一下
  if (!response.ok) {
    throw new Error((await response.text()) || response.statusText)
  }
}
