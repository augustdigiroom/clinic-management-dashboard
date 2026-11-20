import type { ApiEnvironmentConfig, ApiMode } from './config'
import type { ApiError, ApiEnvelope } from './models'

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export interface ApiRequestOptions {
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  signal?: AbortSignal
}

export interface ApiClient {
  readonly mode: ApiMode
  request<T>(path: string, method?: HttpMethod, options?: ApiRequestOptions): Promise<T>
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>
  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T>
}

export class ApiRequestError extends Error {
  readonly status?: number
  readonly details?: unknown

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.status = error.status
    this.details = error.details
  }
}

function isApiError(value: unknown): value is Partial<ApiError> {
  return typeof value === 'object' && value !== null
}

export function createApiClient(mode: ApiMode, config: ApiEnvironmentConfig): ApiClient {
  const request = async <T>(
    path: string,
    method: HttpMethod = 'GET',
    options: ApiRequestOptions = {},
  ): Promise<T> => {
    if (config.readOnly && method !== 'GET') {
      throw new ApiRequestError({
        message: `The ${mode} API is read-only; ${method} requests are blocked.`,
      })
    }

    const url = new URL(path.replace(/^\/+/, ''), `${config.baseUrl.replace(/\/+$/, '')}/`)
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }

    let response: Response
    try {
      response = await fetch(url, {
        method,
        signal: options.signal,
        headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      })
    } catch (error) {
      throw new ApiRequestError({
        message: error instanceof Error ? error.message : 'Network request failed.',
      })
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      payload = undefined
    }

    if (!response.ok) {
      const apiError = isApiError(payload) ? payload : {}
      throw new ApiRequestError({
        message: typeof apiError.message === 'string'
          ? apiError.message
          : `Request failed with HTTP ${response.status}.`,
        status: response.status,
        details: apiError.details ?? payload,
      })
    }

    return payload as T
  }

  return {
    mode,
    request,
    get: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, 'GET', options),
    post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
      request<T>(path, 'POST', { ...options, body }),
    patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
      request<T>(path, 'PATCH', { ...options, body }),
    delete: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, 'DELETE', options),
  }
}

export function unwrapApiResponse<T>(response: ApiEnvelope<T>): T {
  return response.data
}
