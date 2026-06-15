import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import "./Calendar.css";

const CONNECTED_DOCTOR_COLOR = "#3b82f6";

// ─── Construction des événements FullCalendar ─────────────────────────────
function buildEvents(appointments = [], sharedDoctors = [], connectedDoctorId = null) {
  const ownEvents = appointments.map((appt) => ({
    id: String(appt.id),
    title: appt.patientName ?? appt.title ?? "Rendez-vous",
    start: appt.start,
    end: appt.end,
    backgroundColor: CONNECTED_DOCTOR_COLOR,
    borderColor: CONNECTED_DOCTOR_COLOR,
    textColor: "#ffffff",
    extendedProps: {
      patientName:      appt.patientName      ?? null,
      patientFirstName: appt.patientFirstName ?? null,
      patientLastName:  appt.patientLastName  ?? null,
      patientGender:    appt.patientGender    ?? null,
      patientUserId:    appt.patientUserId    ?? null,
      patientEmail:     appt.patientEmail     ?? null,
      patientPhone:     appt.patientPhone     ?? null,
      notes:            appt.notes            ?? null,
      status:           appt.status           ?? "scheduled",
      doctorId:         connectedDoctorId,
      doctorName:       null,
    },
  }));

  const sharedEvents = sharedDoctors
    .filter((d) => d.share_calendar === 1)
    .flatMap((d) =>
      (d.appointments ?? []).map((appt) => ({
        id: `shared-${d.doctor_id}-${appt.id}`,
        title: appt.patientName ?? appt.title ?? "Rendez-vous",
        start: appt.start,
        end: appt.end,
        backgroundColor: d.color ?? "#6b7280",
        borderColor: d.color ?? "#6b7280",
        textColor: "#ffffff",
        extendedProps: {
          patientName:      appt.patientName      ?? null,
          patientFirstName: appt.patientFirstName ?? null,
          patientLastName:  appt.patientLastName  ?? null,
          patientGender:    appt.patientGender    ?? null,
          patientUserId:    appt.patientUserId    ?? null,
          patientEmail:     appt.patientEmail     ?? null,
          patientPhone:     appt.patientPhone     ?? null,
          notes:            appt.notes            ?? null,
          status:           appt.status           ?? "scheduled",
          doctorId:         d.doctor_id,
          doctorName:       d.doctor_name,
        },
      }))
    );

  return [...ownEvents, ...sharedEvents];
}

// ─── Icône de genre ───────────────────────────────────────────────────────
function GenderAvatar({ gender, name }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const bg = gender === "female" ? "#ec4899" : "#6366f1";
  return (
    <span
      className="fc-popover-avatar"
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

// ─── Couleurs de statut ───────────────────────────────────────────────────
const STATUS_MAP = {
  scheduled: { label: "Planifié",  cls: "fc-status-scheduled", dot: "#93c5fd" },
  confirmed: { label: "Confirmé",  cls: "fc-status-confirmed", dot: "#6ee7b7" },
  canceled:  { label: "Annulé",    cls: "fc-status-canceled",  dot: "#fca5a5" },
  completed: { label: "Terminé",   cls: "fc-status-completed", dot: "#d1d5db" },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: "" };
  return <span className={`fc-status-badge ${s.cls}`}>{s.label}</span>;
}

// ─── Popover de détail d'événement ────────────────────────────────────────
function EventPopover({ data, onClose, onEdit, onCancel }) {
  const ref = useRef(null);

  // Fermeture sur Échap
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Ajustement pour rester dans le viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { innerWidth, innerHeight } = window;
    const rect = el.getBoundingClientRect();
    let { x, y } = data.position;
    if (x + rect.width + 16 > innerWidth)  x = innerWidth  - rect.width  - 16;
    if (y + rect.height + 16 > innerHeight) y = innerHeight - rect.height - 16;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;
  }, [data.position]);

  const { event, position } = data;
  const { patientName, patientGender, notes, status, doctorName } = event.extendedProps;

  const start = event.start;
  const end   = event.end;
  const timeLabel = start
    ? `${start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}${
        end ? ` – ${end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""
      }`
    : "";
  const dateLabel = start
    ? start.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
    : "";

  const isCancelable = status === "scheduled" || status === "confirmed";

  return (
    <>
      {/* Backdrop transparent pour fermer au clic extérieur */}
      <div className="fc-popover-backdrop" onClick={onClose} />

      <div className="fc-event-popover" ref={ref} style={{ left: position.x, top: position.y }}>
        {/* En-tête */}
        <div className="fc-popover-header">
          <div className="fc-popover-time">
            <svg className="fc-popover-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{dateLabel}</span>
          </div>
          <div className="fc-popover-time-range">{timeLabel}</div>
          <button className="fc-popover-close" onClick={onClose} title="Fermer">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corps */}
        <div className="fc-popover-body">
          {/* Patient */}
          <div className="fc-popover-row">
            <GenderAvatar gender={patientGender} name={patientName} />
            <div className="fc-popover-patient">
              <span className="fc-popover-patient-name">
                {patientName ?? <em className="fc-popover-empty">Patient non renseigné</em>}
              </span>
              <StatusBadge status={status} />
            </div>
          </div>

          {/* Médecin (agenda partagé uniquement) */}
          {doctorName && (
            <div className="fc-popover-row fc-popover-doctor">
              <svg className="fc-popover-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{doctorName}</span>
            </div>
          )}

          {/* Commentaire */}
          {notes ? (
            <div className="fc-popover-notes">
              <svg className="fc-popover-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p>{notes}</p>
            </div>
          ) : (
            <p className="fc-popover-empty fc-popover-no-notes">Aucun commentaire</p>
          )}
        </div>

        {/* Actions */}
        <div className="fc-popover-actions">
          <button
            className="fc-popover-btn fc-popover-btn-edit"
            onClick={() => { onEdit(event); onClose(); }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>
          {isCancelable && (
            <button
              className="fc-popover-btn fc-popover-btn-cancel"
              onClick={() => { onCancel(event); onClose(); }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
          )}
        </div>
      </div>
    </>
  );
}


// ─── Composant principal ──────────────────────────────────────────────────
/**
 * Props :
 *  appointments        {Array}    RDV du docteur connecté.
 *  sharedDoctors       {Array}    Médecins partageant leur agenda.
 *  connectedDoctorId   {number}
 *  connectedDoctorName {string}
 *  initialView         {string}   (défaut : timeGridWeek)
 *  initialDate         {string}   ISO date
 *  minTime / maxTime   {string}   (défaut : 07:00 / 20:00)
 *  selectable          {boolean}
 *  editable            {boolean}
 *  onDateClick         {Function} (info) => void
 *  onDateSelect        {Function} (info) => void
 *  onEventEdit         {Function} (fcEvent) => void  — bouton Modifier du popover
 *  onEventCancel       {Function} (fcEvent) => void  — bouton Annuler du popover
 *  onEventDrop         {Function} (info) => void
 *  onEventResize       {Function} (info) => void
 */
export default function Calendar({
  appointments = [],
  sharedDoctors = [],
  connectedDoctorId = null,
  connectedDoctorName = "Mon agenda",
  initialView = "timeGridWeek",
  initialDate,
  minTime = "07:00:00",
  maxTime = "20:00:00",
  selectable = true,
  editable = true,
  onDateClick,
  onDateSelect,
  onEventEdit,
  onEventCancel,
  onEventDrop,
  onEventResize,
  onViewChange,
  height = "auto",
}) {
  const calendarRef = useRef(null);
  const [popover, setPopover] = useState(null); // { event, position: {x,y} }

  const events = useMemo(
    () => buildEvents(appointments, sharedDoctors, connectedDoctorId),
    [appointments, sharedDoctors, connectedDoctorId]
  );

  // Contenu de l'événement dans la grille
  const renderEventContent = useCallback((eventInfo) => {
    const { patientName, notes, doctorName, status } = eventInfo.event.extendedProps;
    const statusDot = STATUS_MAP[status]?.dot ?? "#9ca3af";
    return (
      <div className="fc-event-inner">
        <div className="fc-event-title-row">
          <span className="fc-event-status-dot" style={{ backgroundColor: statusDot }} />
          <span className="fc-event-title">{patientName ?? eventInfo.event.title}</span>
        </div>
        {notes && <span className="fc-event-notes">{notes}</span>}
        {doctorName && <span className="fc-event-doctor">{doctorName}</span>}
      </div>
    );
  }, []);

  // Applique la couleur du médecin directement sur l'élément DOM (contourne les conflits CSS)
  const handleEventDidMount = useCallback((info) => {
    const color  = info.event.backgroundColor;
    const border = info.event.borderColor || color;
    if (color) {
      info.el.style.backgroundColor  = color;
      info.el.style.borderLeftColor  = border;
    }
    if (info.event.extendedProps.status === "canceled") {
      info.el.style.opacity = "0.45";
    }
  }, []);

  // Clic sur un événement → ouvrir le popover
  const handleEventClick = useCallback((info) => {
    const rect = info.el.getBoundingClientRect();
    setPopover({
      event: info.event,
      position: {
        x: rect.right + 8,
        y: rect.top,
      },
    });
  }, []);

  // Notifie le parent quand la vue ou la date change (persistance localStorage)
  const handleDatesSet = useCallback((info) => {
    const d = info.view.currentStart;
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    onViewChange?.(info.view.type, date);
  }, [onViewChange]);

  return (
    <div className="fc-wrapper" style={height === "100%" ? { height: "100%" } : undefined}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        locale={frLocale}
        timeZone="local"
        initialView={initialView}
        initialDate={initialDate}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        buttonText={{
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          list: "Liste",
        }}
        slotMinTime={minTime}
        slotMaxTime={maxTime}
        slotDuration="00:15:00"
        slotLabelInterval="01:00"
        slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        allDaySlot={false}
        nowIndicator
        weekNumbers
        weekNumberFormat={{ week: "numeric" }}
        dayMaxEvents={4}
        moreLinkText={(n) => `+${n} autres`}
        height={height}
        expandRows
        stickyHeaderDates
        events={events}
        eventContent={renderEventContent}
        eventDidMount={handleEventDidMount}
        selectable={selectable}
        selectMirror
        editable={editable}
        droppable={editable}
        eventResizableFromStart={editable}
        dateClick={onDateClick}
        select={onDateSelect}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
      />

      {/* Popover de détail */}
      {popover && (
        <EventPopover
          data={popover}
          onClose={() => setPopover(null)}
          onEdit={onEventEdit ?? (() => {})}
          onCancel={onEventCancel ?? (() => {})}
        />
      )}
    </div>
  );
}
