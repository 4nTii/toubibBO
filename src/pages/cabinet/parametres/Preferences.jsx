import { useState } from "react";
import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";
import { useDoctor } from "../../../context/DoctorContext";
import { DAYS_FR, DAYS_ORDER } from "../../../services/dateService";
import { DURATION_OPTIONS } from "../../../services/doctorService";
import {
  updateBusinessSite,
  createBusinessSite,
  deleteCollaborator,
} from "../../../services/businessSiteService";
import { MESSAGE_TIMEOUT, CURRENCY_SYMBOL } from "../../../config/config";
import EditCabinetModal from "./form/EditCabinetModal";
import AddCabinetModal from "./form/AddCabinetModal";

function CabinetCard({ site, onEdit }) {
  const {
    businessSite,
    isOwner,
    isPrimary,
    consultationDuration,
    consultationFee,
    workingSchedule,
  } = site;

  const formatFee = (fee) => {
    if (!fee) return "Non défini";
    return `${(fee / 100).toFixed(2)} ${CURRENCY_SYMBOL}`;
  };

  const formatDuration = (duration) => {
    const option = DURATION_OPTIONS.find((o) => o.value === duration);
    return option ? option.label : `${duration} min`;
  };

  const getEnabledDays = () => {
    if (!workingSchedule) return "Non défini";
    const days = DAYS_ORDER.filter((day) => workingSchedule[day]?.enabled);
    if (days.length === 0) return "Aucun";
    return days.map((day) => DAYS_FR[day].substring(0, 3)).join(", ");
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-gray-600 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {businessSite.name}
          </h3>
          <p className="text-gray-400 text-sm">{businessSite.ville}</p>
        </div>
        <div className="flex gap-2">
          {isPrimary && (
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
              Principal
            </span>
          )}
          {isOwner && (
            <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
              Propriétaire
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p className="text-gray-300">
          <span className="text-gray-500">Adresse:</span> {businessSite.address}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">Région:</span>{" "}
          {businessSite.region?.name || "Non définie"}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">Téléphone:</span> {businessSite.phone}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">Email:</span> {businessSite.email}
        </p>
        <hr className="border-gray-700 my-3" />
        <p className="text-gray-300">
          <span className="text-gray-500">Durée consultation:</span>{" "}
          {formatDuration(consultationDuration)}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">Tarif:</span>{" "}
          {formatFee(consultationFee)}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">Jours travaillés:</span>{" "}
          {getEnabledDays()}
        </p>
      </div>

      <button
        onClick={() => onEdit(site)}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
      >
        Modifier
      </button>
    </div>
  );
}

function AddCabinetCard({ onClick }) {
  return (
    <div className="flex items-center justify-center">
      <button
        onClick={onClick}
        className="bg-gray-800 rounded-lg p-4 shadow-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition flex items-center gap-3 cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <span className="text-gray-400 font-medium">Ajouter un cabinet</span>
      </button>
    </div>
  );
}

function Preferences() {
  const { doctor, isLoading, fetchDoctorInfo } = useDoctor();
  const [editingSite, setEditingSite] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), MESSAGE_TIMEOUT);
  };

  const handleSave = async (payload, businessSiteId) => {
    setIsSaving(true);

    const result = await updateBusinessSite(businessSiteId, payload);

    if (result.success) {
      showMessage("success", result.message);
      await fetchDoctorInfo();
    } else {
      showMessage("error", result.error);
    }

    setIsSaving(false);
    return result.success;
  };

  const handleCreate = async (payload) => {
    setIsSaving(true);

    const result = await createBusinessSite(payload);

    if (result.success) {
      showMessage("success", result.message);
      setShowAddModal(false);
      await fetchDoctorInfo();
    } else {
      showMessage("error", result.error);
    }

    setIsSaving(false);
  };

  const handleDeleteCollaborator = async (
    doctorBusinessSiteId,
    businessSiteId,
  ) => {
    setIsSaving(true);

    const result = await deleteCollaborator(
      businessSiteId,
      doctorBusinessSiteId,
    );

    if (result.success) {
      showMessage("success", result.message);
      await fetchDoctorInfo();
    } else {
      showMessage("error", result.error);
    }

    setIsSaving(false);
    return result.success;
  };

  if (isLoading) {
    return (
      <Layout>
        <CabinetLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Chargement...</div>
          </div>
        </CabinetLayout>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <CabinetLayout>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <p className="text-red-400">
              Impossible de charger les informations.
            </p>
          </div>
        </CabinetLayout>
      </Layout>
    );
  }

  const sites = doctor.doctorBusinessSites || [];

  return (
    <Layout>
      <CabinetLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Mes Cabinets</h2>
          <span className="text-gray-400">{sites.length} cabinet(s)</span>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-600/20 text-green-400"
                : "bg-red-600/20 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <CabinetCard key={site.id} site={site} onEdit={setEditingSite} />
          ))}
          <AddCabinetCard onClick={() => setShowAddModal(true)} />
        </div>
      </div>

      {editingSite && (
        <EditCabinetModal
          site={editingSite}
          onClose={() => setEditingSite(null)}
          onSave={handleSave}
          onDeleteCollaborator={handleDeleteCollaborator}
          isSaving={isSaving}
          isOwner={editingSite.isOwner}
          doctor={doctor}
        />
      )}

      {showAddModal && (
        <AddCabinetModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreate}
          isSaving={isSaving}
        />
      )}
      </CabinetLayout>
    </Layout>
  );
}

export default Preferences;
