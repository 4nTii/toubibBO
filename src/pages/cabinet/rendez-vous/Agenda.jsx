import { useState, useEffect, useCallback } from "react";
import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";
import { useDoctor } from "../../../context/DoctorContext";
import Calendar from "../../../components/calendar/Calendar";
import AppointmentDrawer from "../../../components/AppointmentDrawer";
import {
  getCalendarData,
  updateAppointmentStatus,
} from "../../../services/appointmentService";

// ── Sélecteur de cabinet ──────────────────────────────────────────────────────
function BusinessSiteSelector({ sites, selectedId, onChange }) {
  if (sites.length <= 1) return null;
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-400 whitespace-nowrap">Cabinet :</label>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {sites.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} — {s.ville}
            {s.isPrimary ? " (principal)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Légende des couleurs des médecins ─────────────────────────────────────────
function ColorLegend({ sharedDoctors, connectedDoctorName }) {
  if (sharedDoctors.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
        <span className="text-gray-300">{connectedDoctorName} (vous)</span>
      </div>
      {sharedDoctors.map((d) => (
        <div key={d.doctor_id} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: d.color }}
          />
          <span className="text-gray-300">{d.doctor_name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Persistance de la vue calendrier ─────────────────────────────────────────
const CALENDAR_STATE_KEY = "toubib_agenda_state";

function readCalendarState() {
  try {
    const raw = localStorage.getItem(CALENDAR_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCalendarState(view, date) {
  try {
    localStorage.setItem(CALENDAR_STATE_KEY, JSON.stringify({ view, date }));
  } catch {}
}

// ── Page principale ───────────────────────────────────────────────────────────
function Agenda() {
  const { doctor, user } = useDoctor();

  const savedState = readCalendarState();

  const [businessSites, setBusinessSites]       = useState([]);
  const [selectedSiteId, setSelectedSiteId]     = useState(null);
  const [appointments, setAppointments]          = useState([]);
  const [sharedDoctors, setSharedDoctors]        = useState([]);
  const [loading, setLoading]                    = useState(true);
  const [feedback, setFeedback]                  = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [calendarView] = useState(savedState.view ?? "timeGridWeek");
  const [calendarDate] = useState(savedState.date ?? undefined);

  const showFeedback = useCallback((message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  }, []);

  // ── Chargement des données du calendrier ──────────────────────────────────
  const loadCalendar = useCallback(async (businessSiteId = null) => {
    setLoading(true);
    try {
      const res = await getCalendarData(businessSiteId);
      if (!res?.status) {
        showFeedback(res?.message ?? "Erreur lors du chargement", "error");
        return;
      }
      const { businessSites: sites, selectedBusinessSiteId, appointments: appts, sharedDoctors: shared } = res.data;
      setBusinessSites(sites ?? []);
      setSelectedSiteId(selectedBusinessSiteId ?? null);
      setAppointments(appts ?? []);
      setSharedDoctors(shared ?? []);
    } catch {
      showFeedback("Erreur réseau lors du chargement de l'agenda", "error");
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    loadCalendar(null);
  }, [loadCalendar]);

  // Recharger quand un RDV est modifié ailleurs (badge, En attente, etc.)
  useEffect(() => {
    const handler = () => loadCalendar(selectedSiteId);
    window.addEventListener("scheduled-appointments-updated", handler);
    return () => window.removeEventListener("scheduled-appointments-updated", handler);
  }, [loadCalendar, selectedSiteId]);

  // ── Changement de cabinet ─────────────────────────────────────────────────
  const handleSiteChange = useCallback((id) => {
    setSelectedSiteId(id);
    loadCalendar(id);
  }, [loadCalendar]);

  // ── Annulation depuis le popover ──────────────────────────────────────────
  const handleEventCancel = useCallback(async (fcEvent) => {
    const id = Number(fcEvent.id);
    try {
      const res = await updateAppointmentStatus(id, "canceled");
      if (res.status) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "canceled" } : a))
        );
        window.dispatchEvent(new Event("scheduled-appointments-updated"));
        showFeedback("Rendez-vous annulé.");
      } else {
        showFeedback(res.message ?? "Erreur lors de l'annulation.", "error");
      }
    } catch {
      showFeedback("Erreur réseau.", "error");
    }
  }, [showFeedback]);

  // ── Modification depuis le popover ────────────────────────────────────────
  const handleEventEdit = useCallback((fcEvent) => {
    if (String(fcEvent.id).startsWith("shared-")) {
      showFeedback("Vous ne pouvez pas modifier les rendez-vous d'un autre médecin.", "error");
      return;
    }
    const props = fcEvent.extendedProps;
    // startStr inclut l'offset tz ("2026-06-12T09:00:00+02:00") → slice(0,19) donne l'heure locale
    setEditingAppointment({
      id:        Number(fcEvent.id),
      startTime: fcEvent.startStr.slice(0, 19),
      endTime:   (fcEvent.endStr ?? "").slice(0, 19),
      notes:     props.notes,
      patient: {
        userId:    props.patientUserId,
        firstName: props.patientFirstName,
        lastName:  props.patientLastName,
        email:     props.patientEmail,
        phone:     props.patientPhone,
        gender:    props.patientGender,
      },
    });
  }, [showFeedback]);

  // ── Persistance de la vue ─────────────────────────────────────────────────
  const handleViewChange = useCallback((view, date) => {
    saveCalendarState(view, date);
  }, []);

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleEventDrop = useCallback((info) => {
    showFeedback(`Déplacé vers ${info.event.start.toLocaleString("fr-FR")}`, "success");
    // TODO: updateAppointmentFull(info.event.id, { startDate, endDate })
    // En cas d'erreur : info.revert()
  }, [showFeedback]);

  const handleEventResize = useCallback((info) => {
    showFeedback("Durée modifiée.", "success");
    // TODO: updateAppointmentFull(info.event.id, { startDate, endDate })
    // En cas d'erreur : info.revert()
  }, [showFeedback]);

  const connectedDoctorName = user
    ? `Dr ${user.lastName ?? ""}`.trim()
    : "Mon agenda";

  const currentSite = businessSites.find((s) => s.id === selectedSiteId);

  return (
    <Layout>
      <CabinetLayout>
        <div className="space-y-4">
          {/* En-tête */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">Mon Agenda</h2>
              {currentSite && (
                <p className="text-gray-400 text-sm mt-0.5">
                  {currentSite.name} — {currentSite.address}, {currentSite.ville}
                </p>
              )}
            </div>
            <BusinessSiteSelector
              sites={businessSites}
              selectedId={selectedSiteId}
              onChange={handleSiteChange}
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
              feedback.type === "error"   ? "bg-red-900/50   border border-red-700   text-red-300"   :
              feedback.type === "success" ? "bg-green-900/50 border border-green-700 text-green-300" :
                                            "bg-blue-900/50  border border-blue-700  text-blue-300"
            }`}>
              {feedback.message}
            </div>
          )}

          {/* Légende des couleurs */}
          <ColorLegend
            sharedDoctors={sharedDoctors}
            connectedDoctorName={connectedDoctorName}
          />

          {/* Calendrier */}
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-gray-800 rounded-xl">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm">Chargement de l'agenda…</span>
              </div>
            </div>
          ) : (
            <Calendar
              appointments={appointments}
              sharedDoctors={sharedDoctors}
              connectedDoctorId={doctor?.id}
              connectedDoctorName={connectedDoctorName}
              initialView={calendarView}
              initialDate={calendarDate}
              onViewChange={handleViewChange}
              onEventEdit={handleEventEdit}
              onEventCancel={handleEventCancel}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
            />
          )}
        </div>
      </CabinetLayout>

      {/* Drawer de modification — même composant que "En attente" */}
      {editingAppointment && (
        <AppointmentDrawer
          doctorId={doctor?.id}
          initialAppointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSuccess={(message) => {
            showFeedback(message);
            loadCalendar(selectedSiteId);
            window.dispatchEvent(new Event("scheduled-appointments-updated"));
          }}
        />
      )}
    </Layout>
  );
}

export default Agenda;
