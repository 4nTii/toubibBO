import { useState } from "react";
import { DAYS_FR, DAYS_ORDER } from "../../../../services/dateService";
import { DURATION_OPTIONS } from "../../../../services/doctorService";
import { REGIONS } from "./formConstants";
import { CURRENCY_SYMBOL } from "../../../../config/config";
import bgTransparent from "../../../../assets/images/backgrounds/bg-transparent.png";

const DEFAULT_SCHEDULE = DAYS_ORDER.reduce((acc, day) => {
  acc[day] = { enabled: false, start: "08:00", end: "18:00" };
  return acc;
}, {});

function AddCabinetModal({ onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    ville: "",
    regionId: 8,
    phone: "",
    email: "",
    consultationDuration: 30,
    consultationFee: 0,
    workingSchedule: DEFAULT_SCHEDULE,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
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

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom du cabinet est requis";
    }
    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise";
    }
    if (!formData.ville.trim()) {
      newErrors.ville = "La ville est requise";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      name: formData.name,
      address: formData.address,
      ville: formData.ville,
      region: formData.regionId,
      phone: formData.phone,
      email: formData.email,
      doctorBusinessSite: {
        consultationDuration: formData.consultationDuration,
        consultationFee: formData.consultationFee,
        workingSchedule: formData.workingSchedule,
        isPrimary: false,
      },
    };

    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundImage: `url(${bgTransparent})` }}
    >
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Ajouter un cabinet</h2>
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

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Informations du cabinet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">
                    Nom du cabinet *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${
                      errors.name ? "border-red-500" : "border-gray-600"
                    } focus:border-blue-500 focus:outline-none`}
                    placeholder="Cabinet médical..."
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">Adresse *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${
                      errors.address ? "border-red-500" : "border-gray-600"
                    } focus:border-blue-500 focus:outline-none`}
                    placeholder="123 rue..."
                  />
                  {errors.address && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Ville *</label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => handleChange("ville", e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${
                      errors.ville ? "border-red-500" : "border-gray-600"
                    } focus:border-blue-500 focus:outline-none`}
                    placeholder="Paris"
                  />
                  {errors.ville && (
                    <p className="text-red-400 text-sm mt-1">{errors.ville}</p>
                  )}
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
                  <label className="block text-gray-400 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${
                      errors.phone ? "border-red-500" : "border-gray-600"
                    } focus:border-blue-500 focus:outline-none`}
                    placeholder="01 23 45 67 89"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${
                      errors.email ? "border-red-500" : "border-gray-600"
                    } focus:border-blue-500 focus:outline-none`}
                    placeholder="contact@cabinet.fr"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-700" />

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
                    placeholder="25.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-80 flex-shrink-0">
            <h3 className="text-lg font-semibold text-white mb-4">
              Horaires de travail
            </h3>
            <div className="space-y-3">
              {DAYS_ORDER.map((day) => {
                const schedule = formData.workingSchedule[day];
                return (
                  <div
                    key={day}
                    className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg"
                  >
                    <label className="flex items-center gap-2 w-24">
                      <input
                        type="checkbox"
                        checked={schedule.enabled}
                        onChange={(e) =>
                          handleScheduleChange(day, "enabled", e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-gray-300 text-sm">
                        {DAYS_FR[day]}
                      </span>
                    </label>
                    <input
                      type="time"
                      value={schedule.start}
                      onChange={(e) =>
                        handleScheduleChange(day, "start", e.target.value)
                      }
                      disabled={!schedule.enabled}
                      className="px-2 py-1 bg-gray-600 text-white text-sm rounded border border-gray-500 disabled:opacity-50 w-24"
                    />
                    <span className="text-gray-400 text-sm">à</span>
                    <input
                      type="time"
                      value={schedule.end}
                      onChange={(e) =>
                        handleScheduleChange(day, "end", e.target.value)
                      }
                      disabled={!schedule.enabled}
                      className="px-2 py-1 bg-gray-600 text-white text-sm rounded border border-gray-500 disabled:opacity-50 w-24"
                    />
                  </div>
                );
              })}
            </div>
          </div>
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
            {isSaving ? "Création..." : "Créer le cabinet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCabinetModal;
