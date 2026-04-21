import { API_URL } from "../config/config";
import DateUtils from "./dateService";

/**
 * Get user info by fetching from API (uses HttpOnly cookie for auth)
 * @returns {Promise<{status: boolean, user: object} | null>}
 */
export async function getUserInfo() {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const userData = data.data;

    // Format birthDay to fr-FR (day month year) for display
    const formattedBirthDay = userData.birthDay
      ? DateUtils.formatDate(userData.birthDay)
      : null;

    const user = {
      id: userData.id,
      email: userData.email,
      phone: userData.phone,
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthDay: formattedBirthDay,
      birthDayRaw: userData.birthDay || null,
      role: userData.role,
      gender: userData.gender,
      address: userData.address,
      photo: userData.photo,
      biography: userData.biography,
      dateInscription: userData.dateInscription,
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : null,
      isActive: userData.isActive,
      isEmailVerified: userData.isEmailVerified,
      isPhoneVerified: userData.isPhoneVerified,
    };

    return { status: true, user };
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
}
