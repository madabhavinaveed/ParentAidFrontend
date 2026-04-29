/** Base URL for API calls. Default `/api` is proxied by Vite to the backend (works with LAN URL + Docker). */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "/api";

export async function apiCall(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error(
      `Cannot reach API (${url}). Is the backend running and Vite proxy configured (docker compose)?`,
    );
  }
  const text = await res.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error(text.slice(0, 200) || `HTTP ${res.status}`);
    }
  }
  if (!res.ok) {
    const msg =
      typeof data.message === "string" ? data.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
