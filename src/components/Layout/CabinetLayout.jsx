import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/DoctorContext";
import { getScheduledAppointments } from "../../services/appointmentService";
import { APP_NAME } from "../../config/config";

const cabinetMenu = [
  {
    label: "Tableau de bord",
    path: "/cabinet",
    children: [
      { label: "Vue globale", path: "/cabinet" },
      { label: "Activité récente", path: "/cabinet/activite" },
    ],
  },
  {
    label: "Patients",
    path: "/cabinet/patients",
    children: [
      { label: "Liste des patients", path: "/cabinet/patients" },
      { label: "Ajouter un patient", path: "/cabinet/patients/ajouter" },
      { label: "Recherche avancée", path: "/cabinet/patients/recherche" },
    ],
  },
  {
    label: "Dossiers médicaux",
    path: "/cabinet/dossiers",
    children: [
      { label: "Tous les dossiers", path: "/cabinet/dossiers" },
      { label: "Antécédents", path: "/cabinet/dossiers/antecedents" },
      { label: "Traitements", path: "/cabinet/dossiers/traitements" },
      { label: "Documents", path: "/cabinet/dossiers/documents" },
    ],
  },
  {
    label: "Rendez-vous",
    path: "/cabinet/agenda",
    children: [
      { label: "Mon Agenda", path: "/cabinet/agenda" },
      { label: "En attente", path: "/cabinet/rendez-vous/attente" },
      { label: "Nouveau rendez-vous", path: "/cabinet/rendez-vous/nouveau" },
    ],
  },
  {
    label: "Consultations",
    path: "/cabinet/consultations",
    children: [
      {
        label: "Nouvelle consultation",
        path: "/cabinet/consultations/nouvelle",
      },
      { label: "Historique", path: "/cabinet/consultations" },
    ],
  },
  {
    label: "Ordonnances",
    path: "/cabinet/ordonnances",
    children: [
      { label: "Créer ordonnance", path: "/cabinet/ordonnances/creer" },
      { label: "Historique", path: "/cabinet/ordonnances" },
    ],
  },
  {
    label: "Analyses",
    path: "/cabinet/analyses",
    children: [
      { label: "Prescrire examen", path: "/cabinet/analyses/prescrire" },
      { label: "Résultats", path: "/cabinet/analyses" },
    ],
  },
  {
    label: "Facturation",
    path: "/cabinet/facturation",
    children: [
      { label: "Factures", path: "/cabinet/facturation" },
      { label: "Paiements", path: "/cabinet/facturation/paiements" },
    ],
  },
  {
    label: "Messagerie",
    path: "/cabinet/messagerie",
    badge: 0, // TODO: Récupérer le nombre de messages non lus depuis l'API
    children: [
      { label: "Boîte de réception", path: "/cabinet/messagerie" },
      { label: "Notifications", path: "/cabinet/messagerie/notifications" },
    ],
  },
  {
    label: "Paramètres",
    path: "/cabinet/parametres",
    children: [
      { label: "Profil docteur", path: "/cabinet/parametres" },
      {
        label: "Préférences cabinet ",
        path: "/cabinet/parametres/preferences",
      },
      { label: "Sécurité", path: "/cabinet/parametres/securite" },
    ],
  },
];

function CabinetLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [scheduledCount, setScheduledCount] = useState(0);

  const fetchScheduledCount = () => {
    getScheduledAppointments()
      .then((res) => {
        if (res?.status && Array.isArray(res.data)) {
          setScheduledCount(res.data.length);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchScheduledCount();
    window.addEventListener(
      "scheduled-appointments-updated",
      fetchScheduledCount,
    );
    return () =>
      window.removeEventListener(
        "scheduled-appointments-updated",
        fetchScheduledCount,
      );
  }, []);

  // Find active parent based on current path
  const findActiveParent = () => {
    for (const item of cabinetMenu) {
      if (
        location.pathname === item.path ||
        item.children.some((child) => location.pathname === child.path)
      ) {
        return item;
      }
    }
    return cabinetMenu[0];
  };

  const [activeParent, setActiveParent] = useState(findActiveParent);
  const navigate = useNavigate();

  const handleParentClick = (item) => {
    setActiveParent(item);
    // Navigate to first child
    if (item.children && item.children.length > 0) {
      navigate(item.children[0].path);
    }
  };

  const isActiveChild = (path) => location.pathname === path;

  const currentYear = new Date().getFullYear();

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Menu horizontal — fixe dans le flux flex */}
      <nav className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center justify-center space-x-2 w-full">
              {cabinetMenu.map((item) => {
                const badge =
                  item.label === "Rendez-vous"
                    ? scheduledCount
                    : (item.badge ?? 0);
                return (
                  <button
                    key={item.label}
                    onClick={() => handleParentClick(item)}
                    className={`relative px-4 py-2 text-sm font-medium rounded-t-lg transition duration-200 whitespace-nowrap cursor-pointer ${
                      activeParent.label === item.label
                        ? "bg-gray-900 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    {badge > 0 && (
                      <span className="absolute top-0 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — fixe, ne scroll pas avec le contenu */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0 flex flex-col overflow-y-auto">
          <div className="p-4 flex-1">
            <h3 className="text-lg font-semibold text-white mb-4">
              {activeParent.label}
            </h3>
            <nav className="space-y-1">
              {activeParent.children.map((child) => {
                const childBadge =
                  child.path === "/cabinet/rendez-vous/attente"
                    ? scheduledCount
                    : 0;
                return (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg transition duration-200 ${
                      isActiveChild(child.path)
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <span>{child.label}</span>
                    {childBadge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                        {childBadge > 9 ? "9+" : childBadge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <p className="text-center text-gray-500 text-xs">
              {APP_NAME} &copy; {currentYear}
            </p>
          </div>
        </aside>

        {/* Contenu principal — seule zone scrollable */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default CabinetLayout;
