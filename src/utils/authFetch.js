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
      window.location.href = `${import.meta.env.BASE_URL}login`;
      throw new Error("Unauthorized");
    }

    return response;
  } catch (error) {
    console.error("authFetch network error:", error);

    // Optionally redirect or show error UI
    window.location.href = `${import.meta.env.BASE_URL}offline`; //foloseste pathul de base din router
 // or show a toast/modal
    return new Promise(() => {});
  }
};
