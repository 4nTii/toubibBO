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
      isDoctor: userData.isDoctor || false,
    };

    return { status: true, user };
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
}

/**
 * Send forgot password email
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function forgotPassword(email) {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'envoi");
    }

    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if reset token is valid
 * @param {string} token - Reset token
 * @returns {Promise<{valid: boolean, message?: string}>}
 */
export async function checkResetToken(token) {
  try {
    const response = await fetch(`${API_URL}/auth/check-reset-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (response.ok) {
      return { valid: true };
    } else {
      return {
        valid: false,
        message: data.message || "Token invalide ou expiré",
      };
    }
  } catch (error) {
    return { valid: false, message: "Erreur lors de la vérification du token" };
  }
}

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function resetPassword(token, password) {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Mot de passe réinitialisé avec succès",
      };
    } else {
      return {
        success: false,
        error: data.message || "Erreur lors de la réinitialisation",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Erreur lors de la réinitialisation du mot de passe",
    };
  }
}

/**
 * Update user profile (uses HttpOnly cookie for auth)
 * @param {object} fields - Fields to update (firstName, lastName, birthDay, gender, address, email)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function updateUserProfile(fields) {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(fields),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || "Profil mis à jour avec succès",
      };
    } else {
      if (response.status === 401) {
        return { success: false, error: "Session expirée" };
      }
      return {
        success: false,
        error: data.message || "Erreur lors de la mise à jour",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Erreur lors de la mise à jour du profil",
    };
  }
}
