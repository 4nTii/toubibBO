import { API_URL } from "../config/config";

/**
 * Create a new business site
 * @param {object} payload - Business site data
 * @returns {Promise<{success: boolean, message?: string, data?: object, error?: string}>}
 */
export async function createBusinessSite(payload) {
  try {
    const response = await fetch(`${API_URL}/businesssites`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Erreur lors de la création du cabinet",
      };
    }

    return {
      success: true,
      message: data.message || "Cabinet créé avec succès",
      data: data.data,
    };
  } catch (error) {
    return { success: false, error: "Erreur de connexion" };
  }
}

/**
 * Get business site details with doctors list
 * @param {number} businessSiteId
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getBusinessSite(businessSiteId) {
  try {
    const response = await fetch(`${API_URL}/businesssites/${businessSiteId}`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || "Erreur lors du chargement",
      };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Erreur de connexion" };
  }
}

/**
 * Update business site and/or doctor consultation settings
 * @param {number} businessSiteId
 * @param {object} payload
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function updateBusinessSite(businessSiteId, payload) {
  try {
    const response = await fetch(`${API_URL}/businesssites/${businessSiteId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Erreur lors de la mise à jour",
      };
    }

    return {
      success: true,
      message: data.message || "Cabinet mis à jour avec succès",
    };
  } catch (error) {
    return { success: false, error: "Erreur de connexion" };
  }
}

/**
 * Delete a collaborator from business site
 * @param {number} businessSiteId
 * @param {number} doctorBusinessSiteId
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function deleteCollaborator(businessSiteId, doctorBusinessSiteId) {
  try {
    const response = await fetch(
      `${API_URL}/businesssites/${businessSiteId}/doctor/${doctorBusinessSiteId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Erreur lors de la suppression",
      };
    }

    return {
      success: true,
      message: data.message || "Collaborateur supprimé avec succès",
    };
  } catch (error) {
    return { success: false, error: "Erreur de connexion" };
  }
}

/**
 * Build payload for business site update
 * @param {object} businessSiteChanges - Changes to business site fields
 * @param {object} doctorBusinessSiteChanges - Changes to doctor settings
 * @param {number} doctorBusinessSiteId - ID of the doctor-business site relation
 * @param {string[]} invitations - List of emails to invite
 * @returns {object|null} - Payload or null if no changes
 */
export function buildUpdatePayload(
  businessSiteChanges,
  doctorBusinessSiteChanges,
  doctorBusinessSiteId,
  invitations = [],
) {
  const hasBusinessChanges = Object.keys(businessSiteChanges).length > 0;
  const hasDoctorChanges = Object.keys(doctorBusinessSiteChanges).length > 0;
  const hasInvitations = invitations.length > 0;

  if (!hasBusinessChanges && !hasDoctorChanges && !hasInvitations) {
    return null;
  }

  return {
    ...(hasBusinessChanges && businessSiteChanges),
    ...(hasInvitations && { ownerInvitations: invitations }),
    ...(hasDoctorChanges && {
      doctorBusinessSite: {
        id: doctorBusinessSiteId,
        ...doctorBusinessSiteChanges,
      },
    }),
  };
}
