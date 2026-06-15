import { API_URL } from "../config/config";

export async function getScheduledAppointments() {
  const res = await fetch(`${API_URL}/doctor/appointments/scheduled`, {
    credentials: "include",
  });
  return res.json();
}

export async function updateAppointmentStatus(id, status) {
  const res = await fetch(`${API_URL}/doctor/appointments/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function updateAppointmentFull(id, { idUser, startDate, endDate, notes, status, businessSiteId }) {
  const res = await fetch(`${API_URL}/doctor/appointments/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idUser, startDate, endDate, notes: notes || null, status, ...(businessSiteId ? { businessSiteId } : {}) }),
  });
  return res.json();
}

export async function createPatient(data) {
  const res = await fetch(`${API_URL}/doctor/patients`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function searchPatients(q) {
  const res = await fetch(`${API_URL}/doctor/patients/search?q=${encodeURIComponent(q)}`, {
    credentials: "include",
  });
  return res.json();
}

export async function getAvailableSlots(doctorId, startDate, endDate) {
  const res = await fetch(
    `${API_URL}/doctor/${doctorId}/get-appointment/start/${startDate}/end/${endDate}`,
    { credentials: "include" }
  );
  return res.json();
}

/**
 * Données complètes pour le calendrier (cabinets + RDV propres + RDV partagés).
 * @param {number|null} businessSiteId  Cabinet sélectionné (null = cabinet principal)
 */
export async function getCalendarData(businessSiteId = null) {
  const params = businessSiteId ? `?businessSiteId=${businessSiteId}` : "";
  const res = await fetch(`${API_URL}/doctor/calendar${params}`, {
    credentials: "include",
  });
  return res.json();
}

export async function getMyPatients({ page = 1, limit = 20 } = {}) {
  const res = await fetch(`${API_URL}/doctor/patients?page=${page}&limit=${limit}`, {
    credentials: "include",
  });
  return res.json();
}

export async function updatePatient(id, data) {
  const res = await fetch(`${API_URL}/doctor/patients/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function removePatient(id) {
  const res = await fetch(`${API_URL}/doctor/patients/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
}

export async function getPatientAppointments(id, { page = 1, limit = 10 } = {}) {
  const res = await fetch(`${API_URL}/doctor/patients/${id}/appointments?page=${page}&limit=${limit}`, {
    credentials: "include",
  });
  return res.json();
}

export async function getPatientHistory(id, { page = 1, limit = 10 } = {}) {
  const res = await fetch(`${API_URL}/doctor/patients/${id}/history?page=${page}&limit=${limit}`, {
    credentials: "include",
  });
  return res.json();
}

export async function addPatientHistory(id, { notes }) {
  const res = await fetch(`${API_URL}/doctor/patients/${id}/history`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  return res.json();
}

export async function createAppointment(doctorId, userId, startDateTime, endDateTime, notes, businessSiteId = null) {
  const res = await fetch(`${API_URL}/doctor/${doctorId}/set-appointment`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idUser: userId,
      startDate: startDateTime,
      endDate: endDateTime,
      notes: notes || null,
      ...(businessSiteId ? { businessSiteId } : {}),
    }),
  });
  return res.json();
}
