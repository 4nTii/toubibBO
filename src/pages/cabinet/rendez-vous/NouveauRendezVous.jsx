import { useState, useEffect, useCallback } from "react";
import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";
import { useDoctor } from "../../../context/DoctorContext";
import {
  getScheduledAppointments,
  updateAppointmentStatus,
} from "../../../services/appointmentService";
import DateUtils from "../../../services/dateService";
import AppointmentDrawer from "../../../components/AppointmentDrawer";

/* ── Appointment card ─────────────────────────────────────────── */
function PatientAvatar({ gender, firstName }) {
  return (
    <div className={`avatar-user-${gender || "male"} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`} />
  );
}

function AppointmentCard({ appt, onConfirm, onCancel, onEdit, pending }) {
  const start = new Date(appt.startTime);
  const end = new Date(appt.endTime);
  const dateLabel = DateUtils.formatDate(start, "fr-FR", true);
  const timeLabel = `${start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  const relative = DateUtils.getStringDateTimeDiff(start);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col gap-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-white font-semibold capitalize">{dateLabel}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-400 text-sm font-medium">{timeLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 whitespace-nowrap mr-1">{relative}</span>
          <button
            onClick={() => onEdit(appt)}
            title="Modifier"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg p-3 border border-gray-700 bg-gray-900/40">
        <PatientAvatar gender={appt.patient.gender} firstName={appt.patient.firstName} />
        <div className="min-w-0">
          <div className="text-white font-medium truncate">{appt.patient.firstName} {appt.patient.lastName}</div>
          <div className="text-gray-400 text-xs truncate">{appt.patient.email}</div>
          <div className="text-gray-400 text-xs">{appt.patient.phone}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {appt.businessSite.name}
      </div>

      {appt.notes && (
        <div className="bg-gray-900/60 rounded-lg px-3 py-2 text-sm text-gray-300 border border-gray-700">
          <span className="text-gray-500 text-xs block mb-0.5">Commentaire</span>
          {appt.notes}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onConfirm(appt.id)}
          disabled={!!pending}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
        >
          {pending === appt.id + "_confirm" ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          Confirmer
        </button>
        <button
          onClick={() => onCancel(appt.id)}
          disabled={!!pending}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 hover:text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
        >
          {pending === appt.id + "_cancel" ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          Annuler
        </button>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
function NouveauRendezVous() {
  const { doctor } = useDoctor();

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [searchPatient, setSearchPatient] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);

  const fetchAppointments = useCallback(() => {
    return getScheduledAppointments().then((res) => {
      if (res.status) setAppointments(res.data);
    });
  }, []);

  useEffect(() => {
    fetchAppointments().finally(() => setIsLoading(false));
  }, [fetchAppointments]);

  const filtered = appointments.filter((a) => {
    if (searchPatient) {
      const q = searchPatient.toLowerCase();
      if (!`${a.patient.firstName} ${a.patient.lastName}`.toLowerCase().includes(q)) return false;
    }
    if (searchDate && a.startTime.slice(0, 10) !== searchDate) return false;
    return true;
  });

  const showFeedback = useCallback((message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  }, []);

  const handleAction = async (id, status) => {
    const key = id + "_" + (status === "confirmed" ? "confirm" : "cancel");
    setPending(key);
    try {
      const res = await updateAppointmentStatus(id, status);
      if (res.status) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        window.dispatchEvent(new Event("scheduled-appointments-updated"));
        showFeedback(res.message);
      } else {
        showFeedback(res.message ?? "Une erreur est survenue", "error");
      }
    } finally {
      setPending(null);
    }
  };

  const handleEditSuccess = useCallback((message) => {
    showFeedback(message);
    // Re-fetch pour refléter les changements (patient/date modifié ou RDV confirmé retiré de la liste)
    fetchAppointments().then(() => {
      window.dispatchEvent(new Event("scheduled-appointments-updated"));
    });
  }, [showFeedback, fetchAppointments]);

  return (
    <Layout>
      <CabinetLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Rendez-vous en attente</h2>
              <p className="text-gray-400 mt-1 text-sm">
                {isLoading
                  ? "Chargement…"
                  : appointments.length === 0
                  ? "Aucun rendez-vous en attente"
                  : filtered.length === appointments.length
                  ? `${appointments.length} rendez-vous à traiter`
                  : `${filtered.length} / ${appointments.length} rendez-vous`}
              </p>
            </div>
            <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 text-xs font-medium px-3 py-1 rounded-full">
              Statut : Planifié
            </span>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
              feedback.type === "error"
                ? "bg-red-900/50 border border-red-700 text-red-300"
                : "bg-green-900/50 border border-green-700 text-green-300"
            }`}>
              {feedback.message}
            </div>
          )}

          {/* Filtres */}
          {!isLoading && appointments.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher un patient…"
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm cursor-pointer"
                />
              </div>
              {(searchPatient || searchDate) && (
                <button
                  onClick={() => { setSearchPatient(""); setSearchDate(""); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Réinitialiser
                </button>
              )}
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-gray-400">
              <svg className="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              Chargement des rendez-vous…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <svg className="w-12 h-12 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium text-gray-400">
                {appointments.length === 0 ? "Aucun rendez-vous en attente" : "Aucun résultat pour ces filtres"}
              </p>
              <p className="text-sm mt-1">
                {appointments.length === 0
                  ? "Les nouveaux rendez-vous planifiés apparaîtront ici."
                  : "Essayez de modifier votre recherche."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  onConfirm={(id) => handleAction(id, "confirmed")}
                  onCancel={(id) => handleAction(id, "canceled")}
                  onEdit={setEditingAppointment}
                  pending={pending}
                />
              ))}
            </div>
          )}
        </div>
      </CabinetLayout>

      {/* Edit drawer */}
      {editingAppointment && (
        <AppointmentDrawer
          doctorId={doctor?.id}
          initialAppointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </Layout>
  );
}

export default NouveauRendezVous;
