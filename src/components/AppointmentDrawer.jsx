import { useState, useEffect, useRef } from "react";
import {
  searchPatients,
  getAvailableSlots,
  updateAppointmentFull,
  createAppointment,
} from "../services/appointmentService";
import DateUtils from "../services/dateService";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(isoDate, days) {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function timeFromISO(isoDatetime) {
  return isoDatetime.slice(11, 16);
}

/**
 * Drawer de création / modification d'un rendez-vous.
 *
 * Props :
 *   doctorId            {number}   ID du docteur connecté
 *   initialAppointment  {object}   Si présent → mode édition
 *     {
 *       id, startTime, endTime, notes,
 *       patient: { userId, firstName, lastName, email, phone, gender }
 *     }
 *   onClose   {Function}
 *   onSuccess {Function(message)}
 */
function AppointmentDrawer({ doctorId, initialAppointment, onClose, onSuccess }) {
  const isEdit = !!initialAppointment;

  /* ── Patient ── */
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(() =>
    isEdit
      ? {
          id: initialAppointment.patient.userId,
          firstName: initialAppointment.patient.firstName,
          lastName: initialAppointment.patient.lastName,
          email: initialAppointment.patient.email,
          phone: initialAppointment.patient.phone,
          gender: initialAppointment.patient.gender,
        }
      : null
  );
  const searchRef = useRef(null);

  /* ── Slots ── */
  const initialDate = isEdit ? initialAppointment.startTime.slice(0, 10) : todayISO();
  const [weekStart, setWeekStart] = useState(initialDate);
  const weekEnd = addDays(weekStart, 6);
  const [slots, setSlots] = useState({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(isEdit ? initialDate : null);
  const [selectedSlot, setSelectedSlot] = useState(() =>
    isEdit
      ? {
          start: timeFromISO(initialAppointment.startTime),
          end: timeFromISO(initialAppointment.endTime),
        }
      : null
  );

  /* ── Form ── */
  const [notes, setNotes] = useState(initialAppointment?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /* Patient search debounce */
  useEffect(() => {
    if (patientQuery.length < 2) { setPatientResults([]); return; }
    setPatientLoading(true);
    const t = setTimeout(async () => {
      const res = await searchPatients(patientQuery);
      if (res.status) setPatientResults(res.data);
      setPatientLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [patientQuery]);

  /* Fetch slots */
  useEffect(() => {
    if (!doctorId) return;
    setSlotsLoading(true);
    getAvailableSlots(doctorId, weekStart, weekEnd)
      .then((res) => setSlots(res.status ? (res.data?.availableSlots ?? {}) : {}))
      .finally(() => setSlotsLoading(false));
  }, [doctorId, weekStart]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevWeek = () => {
    const prev = addDays(weekStart, -7);
    if (prev < todayISO()) return;
    setWeekStart(prev);
  };
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));
  const isFirstWeek = weekStart <= todayISO();
  const sortedDates = Object.keys(slots).sort();

  const handleSubmit = async (confirm = false) => {
    if (!selectedPatient || !selectedDate || !selectedSlot) return;
    setSubmitting(confirm ? "confirm" : "save");
    setSubmitError(null);

    const startDT = `${selectedDate}T${selectedSlot.start}:00`;
    const endDT   = `${selectedDate}T${selectedSlot.end}:00`;

    const res = isEdit
      ? await updateAppointmentFull(initialAppointment.id, {
          idUser: selectedPatient.id,
          startDate: startDT,
          endDate: endDT,
          notes,
          status: confirm ? "confirmed" : undefined,
        })
      : await createAppointment(doctorId, selectedPatient.id, startDT, endDT, notes);

    setSubmitting(false);
    if (res.status) {
      onSuccess(res.message ?? (isEdit ? "Rendez-vous modifié avec succès" : "Rendez-vous créé avec succès"));
      onClose();
    } else {
      setSubmitError(res.message ?? "Une erreur est survenue");
    }
  };

  const canSubmit = selectedPatient && selectedDate && selectedSlot;
  const isSaving    = submitting === "save";
  const isConfirming = submitting === "confirm";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-900 border-l border-gray-700 z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── 1. Patient ── */}
          <section>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">1. Patient</h3>
            {selectedPatient ? (
              <div className="flex items-center gap-3 bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                <div className={`avatar-user-${selectedPatient.gender || "male"} w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                  {selectedPatient.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium text-sm">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                  <div className="text-blue-300 text-xs truncate">{selectedPatient.email}</div>
                </div>
                <button
                  onClick={() => { setSelectedPatient(null); setPatientQuery(""); setTimeout(() => searchRef.current?.focus(), 50); }}
                  className="text-gray-500 hover:text-white transition cursor-pointer flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Rechercher par nom, email, téléphone…"
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
                {(patientLoading || patientResults.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                    {patientLoading ? (
                      <div className="px-4 py-3 text-sm text-gray-400">Recherche…</div>
                    ) : patientResults.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400">Aucun résultat</div>
                    ) : (
                      patientResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedPatient(p); setPatientQuery(""); setPatientResults([]); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition text-left cursor-pointer"
                        >
                          <div className={`avatar-user-${p.gender || "male"} w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}>
                            {p.firstName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-white text-sm font-medium">{p.firstName} {p.lastName}</div>
                            <div className="text-gray-400 text-xs truncate">{p.email} · {p.phone}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── 2. Créneau ── */}
          <section>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">2. Créneau disponible</h3>

            {isEdit && selectedSlot && (
              <div className="mb-4 flex items-center gap-2 text-xs bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 rounded-lg px-3 py-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Créneau actuel : {DateUtils.formatDate(selectedDate, "fr-FR", true)} · {selectedSlot.start} – {selectedSlot.end}. Choisissez un nouveau créneau ci-dessous pour le modifier.
              </div>
            )}

            {/* Week navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevWeek} disabled={isFirstWeek} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer border border-gray-700">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-gray-300 text-xs font-medium text-center">
                {DateUtils.formatDate(weekStart, "fr-FR")} — {DateUtils.formatDate(weekEnd, "fr-FR")}
              </span>
              <button onClick={nextWeek} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition cursor-pointer border border-gray-700">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {slotsLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                Chargement des créneaux…
              </div>
            ) : sortedDates.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm">Aucun créneau disponible sur cette période.</p>
                <button onClick={nextWeek} className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline underline-offset-2 cursor-pointer">Semaine suivante →</button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDates.map((dateKey) => (
                  <div key={dateKey}>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 capitalize">
                      {DateUtils.formatDate(dateKey, "fr-FR", true)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slots[dateKey].map((slot) => {
                        const isSelected = selectedDate === dateKey && selectedSlot?.start === slot.start;
                        return (
                          <button
                            key={slot.start}
                            onClick={() => { setSelectedDate(dateKey); setSelectedSlot(slot); }}
                            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 text-white ring-2 ring-blue-400"
                                : "bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 hover:border-gray-600"
                            }`}
                          >
                            {slot.start}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected slot recap */}
            {selectedSlot && (
              <div className="mt-4 flex items-center gap-3 bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium capitalize">{DateUtils.formatDate(selectedDate, "fr-FR", true)}</p>
                  <p className="text-blue-300 text-xs">{selectedSlot.start} – {selectedSlot.end}</p>
                </div>
                <button
                  onClick={() => { setSelectedSlot(null); setSelectedDate(null); }}
                  className="text-gray-500 hover:text-white transition cursor-pointer flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </section>

          {/* ── 3. Commentaire ── */}
          <section>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              3. Commentaire <span className="text-gray-600 normal-case font-normal">(optionnel)</span>
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Motif de consultation, notes…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </section>

          {submitError && (
            <p className="text-red-400 text-sm bg-red-900/30 border border-red-700 rounded-lg px-4 py-3">{submitError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex-shrink-0 space-y-2">
          {isEdit ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit(false)}
                disabled={!canSubmit || !!submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition cursor-pointer"
              >
                {isSaving ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
                {isSaving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={!canSubmit || !!submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition cursor-pointer"
              >
                {isConfirming ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {isConfirming ? "Confirmation…" : "Enregistrer et Confirmer"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={!canSubmit || !!submitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition cursor-pointer"
            >
              {isSaving ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              {isSaving ? "Création…" : "Créer le rendez-vous"}
            </button>
          )}
          {!canSubmit && (
            <p className="text-center text-xs text-gray-500">
              {!selectedPatient ? "Sélectionnez un patient" : !selectedSlot ? "Choisissez un créneau" : ""}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default AppointmentDrawer;
