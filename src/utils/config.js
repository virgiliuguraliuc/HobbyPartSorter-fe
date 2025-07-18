// src/config.js
export const getApiBaseUrl = () =>
  // localStorage.getItem("api_base_url") || import.meta.env.VITE_API_BASE_URL;
{
  const url = localStorage.getItem("api_base_url");
    return url || `${window.location.origin}/hpt/api`;
}

export const getAiBaseUrl = () =>
  localStorage.getItem("ai_base_url") || import.meta.env.VITE_AI_BASE_URL; //no need yet

export const setApiBaseUrl = (url) => localStorage.setItem("api_base_url", url);
export const setAiBaseUrl = (url) => localStorage.setItem("ai_base_url", url);
