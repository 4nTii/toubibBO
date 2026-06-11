import { API_URL } from "../config/config";

export async function getUsers({ search = "", role = "", page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  params.set("page", page);
  params.set("limit", limit);

  const res = await fetch(`${API_URL}/admin/users?${params}`, {
    credentials: "include",
  });
  return res.json();
}

export async function suspendUser(id) {
  const res = await fetch(`${API_URL}/admin/users/${id}/suspend`, {
    method: "PATCH",
    credentials: "include",
  });
  return res.json();
}

export async function forcePasswordChange(id) {
  const res = await fetch(`${API_URL}/admin/users/${id}/force-password-change`, {
    method: "PATCH",
    credentials: "include",
  });
  return res.json();
}

export async function toggleDoctor(id) {
  const res = await fetch(`${API_URL}/admin/users/${id}/toggle-doctor`, {
    method: "PATCH",
    credentials: "include",
  });
  return res.json();
}
