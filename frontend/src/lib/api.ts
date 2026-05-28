const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const bloodRequestPath =
  process.env.NEXT_PUBLIC_BLOOD_REQUEST_PATH ?? "/request-blood";

type ApiErrorBody = {
  success?: boolean;
  code?: string;
  message?: string;
};

function buildHeaders(
  initHeaders: HeadersInit | undefined,
  token: string | null | undefined
): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (initHeaders && typeof initHeaders === "object" && !Array.isArray(initHeaders)) {
    Object.assign(headers, initHeaders as Record<string, string>);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function postJson<TResponse>(
  path: string,
  body: unknown,
  init?: Omit<RequestInit, "method" | "body"> & { token?: string | null }
): Promise<TResponse> {
  let res: Response;
  try {
    res = await fetch(`${backendUrl}${path}`, {
      method: "POST",
      headers: buildHeaders(init?.headers, init?.token),
      body: JSON.stringify(body),
      credentials: "include",
      ...init,
    });
  } catch {
    throw new Error(
      `Cannot reach backend at ${backendUrl}. Please ensure backend is running on port 4000.`
    );
  }

  const text = await res.text();
  const json = text ? (JSON.parse(text) as ApiErrorBody | TResponse) : null;

  if (!res.ok) {
    const errBody = (json ?? {}) as ApiErrorBody;
    throw new Error(errBody.message ?? `Request failed with ${res.status}`);
  }

  return json as TResponse;
}

export async function getJson<TResponse>(
  path: string,
  init?: Omit<RequestInit, "method" | "body"> & { token?: string | null }
): Promise<TResponse> {
  let res: Response;
  try {
    res = await fetch(`${backendUrl}${path}`, {
      method: "GET",
      headers: buildHeaders(init?.headers, init?.token),
      credentials: "include",
      ...init,
    });
  } catch {
    throw new Error(
      `Cannot reach backend at ${backendUrl}. Please ensure backend is running on port 4000.`
    );
  }

  const text = await res.text();
  const json = text ? (JSON.parse(text) as ApiErrorBody | TResponse) : null;

  if (!res.ok) {
    const errBody = (json ?? {}) as ApiErrorBody;
    throw new Error(errBody.message ?? `Request failed with ${res.status}`);
  }

  return json as TResponse;
}

export async function patchJson<TResponse>(
  path: string,
  body: unknown,
  init?: Omit<RequestInit, "method" | "body"> & { token?: string | null }
): Promise<TResponse> {
  let res: Response;
  try {
    res = await fetch(`${backendUrl}${path}`, {
      method: "PATCH",
      headers: buildHeaders(init?.headers, init?.token),
      body: JSON.stringify(body),
      credentials: "include",
      ...init,
    });
  } catch {
    throw new Error(
      `Cannot reach backend at ${backendUrl}. Please ensure backend is running on port 4000.`
    );
  }

  const text = await res.text();
  const json = text ? (JSON.parse(text) as ApiErrorBody | TResponse) : null;

  if (!res.ok) {
    const errBody = (json ?? {}) as ApiErrorBody;
    throw new Error(errBody.message ?? `Request failed with ${res.status}`);
  }

  return json as TResponse;
}

export function getBackendUrl() {
  return backendUrl;
}

export function getBloodRequestPath() {
  return bloodRequestPath;
}

