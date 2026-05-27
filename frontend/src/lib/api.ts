const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const bloodRequestPath =
  process.env.NEXT_PUBLIC_BLOOD_REQUEST_PATH ?? "/request-blood";

type ApiErrorBody = {
  success?: boolean;
  code?: string;
  message?: string;
};

export async function postJson<TResponse>(
  path: string,
  body: unknown,
  init?: Omit<RequestInit, "method" | "body">
): Promise<TResponse> {
  let res: Response;
  try {
    res = await fetch(`${backendUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      body: JSON.stringify(body),
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

