export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  // Do not set Content-Type if body is FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
