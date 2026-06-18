import { API_URL } from "../config/config";

/**
 * Refresh the access token using the refresh token cookie
 * @returns {Promise<boolean>} true if refresh was successful
 */
export async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

/**
 * Wrapper for fetch that automatically handles token refresh on 401
 * @param {string} url
 * @param {object} options
 * @returns {Promise<Response>}
 */
export async function fetchWithTokenRefresh(url, options = {}) {
  // Ensure credentials are included
  const fetchOptions = {
    ...options,
    credentials: "include",
  };

  let response = await fetch(url, fetchOptions);

  // If we get 401, try to refresh the token and retry once
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request
      response = await fetch(url, fetchOptions);
    }
  }

  return response;
}
