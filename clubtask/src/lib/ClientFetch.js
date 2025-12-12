const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function authFetch(path, options = {}) {
  const token = localStorage.getItem("token") || "";

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));

  return { ok: res.ok, status: res.status, data };
}
