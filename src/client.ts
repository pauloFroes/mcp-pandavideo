import { API_KEY, BASE_URL } from "./auth.js";

export class PandaVideoApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "PandaVideoApiError";
  }
}

// PandaVideo API limit: 200 requests/minute per IP (429 on exceed)
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>,
  queryParams?: Record<string, string | undefined>,
  baseUrl: string = BASE_URL,
): Promise<T> {
  let url = `${baseUrl}${endpoint}`;

  if (queryParams) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: API_KEY,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return {} as T;
    }

    if (response.status === 429) {
      if (attempt < MAX_RETRIES) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        console.error(`Rate limited (429). Retrying in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await sleep(backoff);
        continue;
      }
      throw new PandaVideoApiError(429, "Rate limit exceeded after retries. PandaVideo allows 200 requests/minute per IP.");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg =
        (error as Record<string, unknown>).message ||
        (error as Record<string, unknown>).errMsg ||
        response.statusText;

      throw new PandaVideoApiError(
        response.status,
        `PandaVideo API error (${response.status}): ${msg}`,
      );
    }

    const text = await response.text();
    if (!text) return {} as T;

    return JSON.parse(text) as T;
  }

  throw new PandaVideoApiError(429, "Rate limit exceeded after retries. PandaVideo allows 200 requests/minute per IP.");
}

export function toolResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function toolError(message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}
