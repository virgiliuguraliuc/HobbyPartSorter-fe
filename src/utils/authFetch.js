export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  // Do not set Content-Type if body is FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 403 Forbidden - redirect to login
  if (response.status === 403) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return new Promise(() => {}); // Halt execution
  }

  return response;
};
