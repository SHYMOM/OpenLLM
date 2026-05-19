const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const password = localStorage.getItem('openllm_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (password) {
    headers['Authorization'] = `Bearer ${password}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('openllm_auth_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const body = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(body.error?.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}
