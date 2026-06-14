const token = () => localStorage.getItem("asrmoda_token");

export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...options.headers
    }
  });
  if (response.status === 401 && token()) {
    localStorage.removeItem("asrmoda_token");
    localStorage.removeItem("asrmoda_user");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "So'rov bajarilmadi");
  return data;
}
