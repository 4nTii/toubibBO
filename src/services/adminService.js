import { API_URL } from "../config/config";

export async function getUsers({ search = "", role = "" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (role) params.set("role", role);

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
