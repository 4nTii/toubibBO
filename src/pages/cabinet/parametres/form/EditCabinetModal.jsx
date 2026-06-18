import { useState, useEffect } from "react";
import ConfirmModal from "../../../../components/UiHTML/ConfirmModal";
import { DAYS_FR, DAYS_ORDER } from "../../../../services/dateService";
import { DURATION_OPTIONS } from "../../../../services/doctorService";
import bgTransparent from "../../../../assets/images/backgrounds/bg-transparent.png";
import {
  getBusinessSite,
  buildUpdatePayload,
} from "../../../../services/businessSiteService";
import { REGIONS, isValidEmail } from "./formConstants";
import { CURRENCY_SYMBOL } from "../../../../config/config";

function EditCabinetModal({
  site,
  onClose,
  onSave,
  onDeleteCollaborator,
  isSaving,
  isOwner,
  doctor,
}) {
  const getRegionId = () => {
    if (site.businessSite.region?.id) return site.businessSite.region.id;
    if (site.businessSite.region?.name) {
      const found = REGIONS.find(
        (r) => r.name === site.businessSite.region.name,
      );
      return found?.id || null;
    }
    return null;
  };

  const [formData, setFormData] = useState({
    name: site.businessSite.name || "",
    address: site.businessSite.address || "",
    ville: site.businessSite.ville || "",
    regionId: getRegionId(),
    phone: site.businessSite.phone || "",
    email: site.businessSite.email || "",
    consultationDuration: site.consultationDuration || 30,
    consultationFee: site.consultationFee || 0,
    workingSchedule: site.workingSchedule || {},
  });

  const [originalData] = useState({ ...formData });
  const [activeTab, setActiveTab] = useState(
    isOwner ? "cabinet" : "consultation",
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitationsList, setInvitationsList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);

  const fetchDoctorsList = async () => {
    const result = await getBusinessSite(site.businessSite.id);
    if (result.success && result.data?.doctors) {
      setDoctorsList(result.data.doctors);
    }
    setIsLoadingDoctors(false);
  };

  useEffect(() => {
    fetchDoctorsList();
  }, [site.businessSite.id]);

  const handleDeleteCollaboratorLocal = async (doctorBusinessSiteId) => {
    const success = await onDeleteCollaborator(
      doctorBusinessSiteId,
      site.businessSite.id,
    );
    if (success) {
      await fetchDoctorsList();
    }
  };

  const currentDoctorIsOwner = doctorsList.find(
    (d) => d.doctorId === doctor?.id,
  )?.isOwner;

  const handleInviteKeyDown = (e) => {
    if (e.key === "Enter" && isValidEmail(inviteEmail)) {
      e.preventDefault();
      handleAddInvitation();
    }
  };

  const handleAddInvitation = () => {
    if (isValidEmail(inviteEmail) && !invitationsList.includes(inviteEmail)) {
      setInvitationsList((prev) => [...prev, inviteEmail]);
      setInviteEmail("");
    }
  };

  const handleRemoveInvitation = (emailToRemove) => {
    setInvitationsList((prev) =>
      prev.filter((email) => email !== emailToRemove),
    );
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      workingSchedule: {
        ...prev.workingSchedule,
        [day]: { ...prev.workingSchedule[day], [field]: value },
      },
    }));
  };

  const getChangedFields = () => {
    const businessSiteChanges = {};
    const doctorBusinessSiteChanges = {};

    if (isOwner) {
      if (formData.name !== originalData.name)
        businessSiteChanges.name = formData.name;
      if (formData.address !== originalData.address)
        businessSiteChanges.address = formData.address;
      if (formData.ville !== originalData.ville)
        businessSiteChanges.ville = formData.ville;
      if (formData.regionId !== originalData.regionId)
        businessSiteChanges.region = formData.regionId;
      if (formData.phone !== originalData.phone)
        businessSiteChanges.phone = formData.phone;
      if (formData.email !== originalData.email)
        businessSiteChanges.email = formData.email;
    }

    if (formData.consultationDuration !== originalData.consultationDuration) {
      doctorBusinessSiteChanges.consultationDuration =
        formData.consultationDuration;
    }
    if (formData.consultationFee !== originalData.consultationFee) {
      doctorBusinessSiteChanges.consultationFee = formData.consultationFee;
    }
    if (
      JSON.stringify(formData.workingSchedule) !==
      JSON.stringify(originalData.workingSchedule)
    ) {
      doctorBusinessSiteChanges.workingSchedule = formData.workingSchedule;
    }

    return { businessSiteChanges, doctorBusinessSiteChanges };
  };

  const handleSubmit = async () => {
    const { businessSiteChanges, doctorBusinessSiteChanges } =
      getChangedFields();

    const payload = buildUpdatePayload(
      businessSiteChanges,
      doctorBusinessSiteChanges,
      site.id,
      invitationsList,
    );

    if (!payload) {
      onClose();
      return;
    }

    const success = await onSave(payload, site.businessSite.id);
    if (success) onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundImage: `url(${bgTransparent})` }}
    >
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Modifier le cabinet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isOwner && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("cabinet")}
              className={`px-4 py-2 text-sm font-medium rounded-tl-lg rounded-tr-lg transition cursor-pointer ${
                activeTab === "cabinet"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
              }`}
            >
              Informations du cabinet
            </button>
            <button
              onClick={() => setActiveTab("consultation")}
              className={`px-4 py-2 text-sm font-medium rounded-tl-lg rounded-tr-lg transition cursor-pointer ${
                activeTab === "consultation"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
              }`}
            >
              Paramètres de consultation
            </button>
          </div>
        )}

        <div className="space-y-6">
          {isOwner && activeTab === "cabinet" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">
                    Nom du cabinet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Ville</label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => handleChange("ville", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Région</label>
                  <select
                    value={formData.regionId ? String(formData.regionId) : ""}
                    onChange={(e) =>
                      handleChange(
                        "regionId",
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    {REGIONS.map((region) => (
                      <option key={region.id} value={String(region.id)}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <hr className="border-gray-700 my-6" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Collaborateurs
                </h3>
                <div className="space-y-2">
                  {isLoadingDoctors ? (
                    <div className="text-gray-400 text-center py-4">
                      Chargement des collaborateurs...
                    </div>
                  ) : (
                    doctorsList.map((doctorItem) => {
                      const isCurrentDoctor =
                        doctorItem.doctorId === doctor?.id;
                      const doctorItemIsOwner = doctorItem.isOwner;
                      const canDelete =
                        currentDoctorIsOwner &&
                        !isCurrentDoctor &&
                        !doctorItemIsOwner;

                      return (
                        <div
                          key={doctorItem.doctorId}
                          className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-300">
                              {doctorItem.firstName} {doctorItem.lastName}
                              {isCurrentDoctor && (
                                <span className="text-gray-500 text-sm ml-2">
                                  (vous)
                                </span>
                              )}
                            </span>
                            {doctorItemIsOwner && (
                              <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded font-medium">
                                Owner
                              </span>
                            )}
                          </div>
                          {canDelete && (
                            <button
                              type="button"
                              className="text-red-400 hover:text-red-300 transition cursor-pointer"
                              onClick={() => {
                                setConfirmModal({
                                  message: `Supprimer ${doctorItem.firstName} ${doctorItem.lastName} du cabinet ?`,
                                  onConfirm: () => {
                                    handleDeleteCollaboratorLocal(
                                      doctorItem.doctorBusinessSiteId,
                                    );
                                    setConfirmModal(null);
                                  },
                                });
                              }}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {invitationsList.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {invitationsList.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-3 bg-yellow-600/10 rounded-lg border border-yellow-600/30"
                      >
                        <div className="flex flex-col">
                          <span className="text-gray-300">{email}</span>
                          <span className="text-yellow-500 text-xs">
                            Invitation...
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-300 transition cursor-pointer"
                          onClick={() => handleRemoveInvitation(email)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 p-1 mt-3 bg-gray-700/30 rounded-lg border border-dashed border-gray-600">
                  <input
                    type="email"
                    placeholder="Email du docteur à inviter"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={handleInviteKeyDown}
                    className="flex-1 px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!isValidEmail(inviteEmail)}
                    className={`p-2 transition cursor-pointer ${
                      isValidEmail(inviteEmail)
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-gray-600 cursor-not-allowed"
                    }`}
                    onClick={handleAddInvitation}
                  >
                    <svg
                      className="w-5 h-5"
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
                  </button>
                </div>

                <span className="text-gray-500 text-xs m-1 text-center">
                  <p>
                    L'attribution ou le retrait du badge Owner se fait
                    uniquement via une demande au support technique Toubib.
                  </p>
                  <p>
                    Appelez la hotline
                    <a href="tel:+33000000000"> +33 0 00 00 00 00</a>.
                  </p>
                </span>
              </div>
            </div>
          )}

          {(!isOwner || activeTab === "consultation") && (
            <>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Paramètres de consultation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">
                      Durée consultation
                    </label>
                    <select
                      value={formData.consultationDuration}
                      onChange={(e) =>
                        handleChange(
                          "consultationDuration",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      {DURATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">
                      Tarif consultation ({CURRENCY_SYMBOL})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={
                        formData.consultationFee
                          ? (formData.consultationFee / 100).toFixed(2)
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "consultationFee",
                          Math.round(parseFloat(e.target.value || 0) * 100),
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Horaires de travail
                </h3>
                <div className="space-y-3">
                  {DAYS_ORDER.map((day) => {
                    const schedule = formData.workingSchedule[day] || {
                      enabled: false,
                      start: "08:00",
                      end: "18:00",
                    };
                    return (
                      <div
                        key={day}
                        className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg"
                      >
                        <label className="flex items-center gap-2 w-28">
                          <input
                            type="checkbox"
                            checked={schedule.enabled}
                            onChange={(e) =>
                              handleScheduleChange(
                                day,
                                "enabled",
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-gray-300">{DAYS_FR[day]}</span>
                        </label>
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) =>
                            handleScheduleChange(day, "start", e.target.value)
                          }
                          disabled={!schedule.enabled}
                          className="px-3 py-1 bg-gray-600 text-white rounded border border-gray-500 disabled:opacity-50"
                        />
                        <span className="text-gray-400">à</span>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) =>
                            handleScheduleChange(day, "end", e.target.value)
                          }
                          disabled={!schedule.enabled}
                          className="px-3 py-1 bg-gray-600 text-white rounded border border-gray-500 disabled:opacity-50"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}

export default EditCabinetModal;
