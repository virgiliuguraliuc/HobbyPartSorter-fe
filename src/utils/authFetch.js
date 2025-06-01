export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return new Promise(() => {});
    }

    return response;
  } catch (error) {
    console.error("authFetch network error:", error);

    // Optionally redirect or show error UI
    window.location.href = "/offline"; // or show a toast/modal
    return new Promise(() => {});
  }
};
