import { useState, useEffect } from "react";
import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";
import { useDoctor } from "../../../context/DoctorContext";
import { MESSAGE_TIMEOUT, FTP_TARGET } from "../../../config/config";

function ProfilCabinet() {
  const { doctor, isLoading, updateDoctor } = useDoctor();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    licenseNumber: "",
    biography: "",
    acceptNewPatients: true,
    teleconsultationEnabled: false,
    speciality: { id: null, name: "", description: "" },
    profilePicturePreview: null,
    profilePictureFile: null,
  });

  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (doctor) {
      const data = {
        licenseNumber: doctor.licenseNumber || "",
        biography: doctor.biography || "",
        acceptNewPatients: doctor.acceptNewPatients ?? true,
        teleconsultationEnabled: doctor.teleconsultationEnabled ?? false,
        speciality: doctor.speciality || {
          id: null,
          name: "",
          description: "",
        },
        profilePicturePreview: null,
        profilePictureFile: null,
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [doctor]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicturePreview: reader.result,
          profilePictureFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getChangedFields = () => {
    const changes = {};

    if (formData.licenseNumber !== originalData.licenseNumber) {
      changes.licenseNumber = formData.licenseNumber;
    }
    if (formData.biography !== originalData.biography) {
      changes.biography = formData.biography;
    }
    if (formData.acceptNewPatients !== originalData.acceptNewPatients) {
      changes.acceptNewPatients = formData.acceptNewPatients;
    }
    if (
      formData.teleconsultationEnabled !== originalData.teleconsultationEnabled
    ) {
      changes.teleconsultationEnabled = formData.teleconsultationEnabled;
    }
    if (formData.speciality.id !== originalData.speciality.id) {
      changes.speciality = formData.speciality.id;
    }

    return changes;
  };

  const handleSave = async () => {
    const changes = getChangedFields();
    const hasPhotoChange = formData.profilePictureFile !== null;

    if (Object.keys(changes).length === 0 && !hasPhotoChange) {
      setMessage({ type: "info", text: "Aucune modification détectée" });
      setTimeout(() => setMessage({ type: "", text: "" }), MESSAGE_TIMEOUT);
      return;
    }

    setIsSaving(true);
    const result = await updateDoctor(changes, formData.profilePictureFile);
    if (result.success) {
      setMessage({ type: "success", text: "Profil mis à jour avec succès" });
      setIsEditing(false);
      setFormData((prev) => ({
        ...prev,
        profilePicturePreview: null,
        profilePictureFile: null,
      }));
      setOriginalData({
        ...formData,
        profilePicturePreview: null,
        profilePictureFile: null,
      });
    } else {
      setMessage({ type: "error", text: result.error });
    }

    setIsSaving(false);
    setTimeout(() => setMessage({ type: "", text: "" }), MESSAGE_TIMEOUT);
  };

  const handleCancel = () => {
    setFormData({
      ...originalData,
      profilePicturePreview: null,
      profilePictureFile: null,
    });
    setIsEditing(false);
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
              Impossible de charger les informations du docteur.
            </p>
          </div>
        </CabinetLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <CabinetLayout>
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Profil Docteur</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                >
                  Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              )}
            </div>

            {message.text && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-600/20 text-green-400"
                    : message.type === "error"
                      ? "bg-red-600/20 text-red-400"
                      : "bg-blue-600/20 text-blue-400"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Photo et infos personnelles */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={
                      formData.profilePicturePreview ||
                      (doctor.profilePicture
                        ? `${FTP_TARGET}${doctor.profilePicture}`
                        : doctor.user?.gender === "female"
                          ? "/images/user/avatar-doctor-female.webp"
                          : "/images/user/avatar-doctor-male.webp")
                    }
                    onError={(e) => {
                      e.target.src =
                        doctor.user?.gender === "female"
                          ? "/images/user/avatar-doctor-female.webp"
                          : "/images/user/avatar-doctor-male.webp";
                    }}
                    alt="Photo du docteur"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-1.5 cursor-pointer transition">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Docteur {doctor.user?.firstName} {doctor.user?.lastName}
                  </h3>
                  <p className="text-gray-400">{doctor.speciality?.name}</p>
                  <p className="text-gray-500 text-sm">
                    {doctor.user?.email} | {doctor.user?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Infos docteur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 mb-2">
                  Numéro de licence
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    handleChange("licenseNumber", e.target.value)
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Spécialité</label>
                <input
                  type="text"
                  value={formData.speciality?.name || ""}
                  disabled
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 opacity-60"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.acceptNewPatients}
                    onChange={(e) =>
                      handleChange("acceptNewPatients", e.target.checked)
                    }
                    disabled={!isEditing}
                    className="w-4 h-4"
                  />
                  Accepte nouveaux patients
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.teleconsultationEnabled}
                    onChange={(e) =>
                      handleChange("teleconsultationEnabled", e.target.checked)
                    }
                    disabled={!isEditing}
                    className="w-4 h-4"
                  />
                  Téléconsultation activée
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-gray-400 mb-2">Biographie</label>
              <textarea
                value={formData.biography}
                onChange={(e) => handleChange("biography", e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default ProfilCabinet;
