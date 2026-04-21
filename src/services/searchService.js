import { API_URL } from "../config/config";

/**
 * Generic fetch helper
 */
async function fetchApi(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_URL}${endpoint}?${queryString}` : `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { success: false, error: "Erreur lors de la recherche" };
    }

    const data = await response.json();
    return { success: true, data: data.data || {} };
  } catch (error) {
    console.error("API error:", error);
    return { success: false, error: "Erreur de connexion" };
  }
}

/**
 * Search for doctors, specialties, establishments
 * @param {string} value - Search query
 * @returns {Promise<{success: boolean, data?: {doctors: array, businessSite: array, specialities: array}, error?: string}>}
 */
export async function search(value) {
  if (value.length < 3) {
    return { success: true, data: { doctors: [], businessSite: [], specialities: [] } };
  }
  return fetchApi("/search", { value });
}

/**
 * Search for geographic locations (regions)
 * @param {string} value - Location query
 * @returns {Promise<{success: boolean, data?: {region: array}, error?: string}>}
 */
export async function searchGeo(value) {
  if (value.length < 3) {
    return { success: true, data: { region: [] } };
  }
  return fetchApi("/searchgeo", { value });
}
