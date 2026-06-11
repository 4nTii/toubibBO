import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout/Layout";
import { getUsers, suspendUser, forcePasswordChange } from "../../services/adminService";

const ROLES = [
  { value: "", label: "Tous les rôles" },
  { value: "ROLE_ADMIN", label: "Admin" },
  { value: "ROLE_DOCTOR", label: "Médecin" },
  { value: "ROLE_USER", label: "Patient" },
];

function RoleBadge({ role }) {
  const map = {
    ROLE_ADMIN: { label: "Admin", cls: "bg-purple-600 text-white" },
    ROLE_DOCTOR: { label: "Médecin", cls: "bg-blue-600 text-white" },
    ROLE_USER: { label: "Patient", cls: "bg-gray-600 text-white" },
  };
  const { label, cls } = map[role] ?? { label: role, cls: "bg-gray-500 text-white" };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${cls}`}>
      {label}
    </span>
  );
}

function ActionButton({ title, onClick, disabled, children, variant = "default" }) {
  const base = "relative group p-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    default: "text-gray-400 hover:text-white hover:bg-gray-600",
    danger: "text-red-400 hover:text-white hover:bg-red-600",
    warning: "text-yellow-400 hover:text-white hover:bg-yellow-600",
    success: "text-green-400 hover:text-white hover:bg-green-600",
  };

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]}`}
    >
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10 border border-gray-700">
        {title}
      </span>
    </button>
  );
}

function SuspendIcon({ isActive }) {
  return isActive ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ForcePasswordIcon({ active }) {
  return active ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

export default function GestionUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getUsers({ search, role: roleFilter });
      if (res.status) setUsers(res.data);
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSuspend = async (user) => {
    setPendingAction(user.id + "_suspend");
    try {
      const res = await suspendUser(user.id);
      if (res.status) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: res.isActive } : u));
        showFeedback(res.message);
      } else {
        showFeedback(res.message ?? "Erreur", "error");
      }
    } finally {
      setPendingAction(null);
    }
  };

  const handleForcePassword = async (user) => {
    setPendingAction(user.id + "_pwd");
    try {
      const res = await forcePasswordChange(user.id);
      if (res.status) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, forcePasswordChange: res.forcePasswordChange } : u));
        showFeedback(res.message);
      } else {
        showFeedback(res.message ?? "Erreur", "error");
      }
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Gestion des utilisateurs</h1>
            <p className="text-gray-400 mt-1">Administrez les comptes utilisateurs de la plateforme.</p>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
                feedback.type === "error"
                  ? "bg-red-900/50 border border-red-700 text-red-300"
                  : "bg-green-900/50 border border-green-700 text-green-300"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <svg className="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Chargement…
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 text-gray-400">Aucun utilisateur trouvé.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Utilisateur</th>
                      <th className="text-left px-6 py-3">Contact</th>
                      <th className="text-left px-6 py-3">Rôle</th>
                      <th className="text-left px-6 py-3">Statut</th>
                      <th className="text-left px-6 py-3">Inscription</th>
                      <th className="text-right px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-750 transition-colors duration-100">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {user.firstName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-gray-400 text-xs">#{user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-300">{user.email}</div>
                          <div className="text-gray-400 text-xs">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <RoleBadge role={user.role} />
                            {user.isDoctor && (
                              <span className="inline-flex items-center gap-1 text-xs text-blue-400">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                Profil médecin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium ${
                                user.isActive ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-400" : "bg-red-400"}`} />
                              {user.isActive ? "Actif" : "Suspendu"}
                            </span>
                            {user.forcePasswordChange && (
                              <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                                </svg>
                                MDP requis
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {user.dateInscription
                            ? new Date(user.dateInscription).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <ActionButton
                              title={user.isActive ? "Suspendre le compte" : "Réactiver le compte"}
                              onClick={() => handleSuspend(user)}
                              disabled={pendingAction === user.id + "_suspend"}
                              variant={user.isActive ? "danger" : "success"}
                            >
                              <SuspendIcon isActive={user.isActive} />
                            </ActionButton>
                            <ActionButton
                              title={
                                user.forcePasswordChange
                                  ? "Lever l'obligation de changement de mot de passe"
                                  : "Forcer le changement de mot de passe à la prochaine connexion"
                              }
                              onClick={() => handleForcePassword(user)}
                              disabled={pendingAction === user.id + "_pwd"}
                              variant={user.forcePasswordChange ? "success" : "warning"}
                            >
                              <ForcePasswordIcon active={user.forcePasswordChange} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!isLoading && users.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-700 text-xs text-gray-400">
                {users.length} utilisateur{users.length > 1 ? "s" : ""} trouvé{users.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
