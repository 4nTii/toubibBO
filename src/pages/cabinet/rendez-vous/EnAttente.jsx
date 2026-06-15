import { useState, useEffect, useRef } from "react";
import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";
import { useDoctor } from "../../../context/DoctorContext";
import {
  searchPatients,
  createPatient,
  getAvailableSlots,
  createAppointment,
} from "../../../services/appointmentService";
import DateUtils from "../../../services/dateService";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(isoDate, days) {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ── Patient search section ───────────────────────────────────── */
function PatientSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await searchPatients(query);
      if (res.status) setResults(res.data);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (p) => {
    onSelect(p);
    setQuery("");
    setResults([]);
    setShowCreate(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher par nom, email, téléphone…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowCreate(false); }}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
        />
        {(loading || results.length > 0 || (query.length >= 2 && !loading)) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-400">Recherche…</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 flex items-center justify-between">
                <span>Aucun résultat pour « {query} »</span>
                <button
                  onClick={() => { setShowCreate(true); setResults([]); setQuery(""); }}
                  className="text-blue-400 hover:text-blue-300 text-xs font-medium underline underline-offset-2 cursor-pointer"
                >
                  Créer ce patient
                </button>
              </div>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition text-left cursor-pointer"
                >
                  <div className={`avatar-user-${p.gender || "male"} w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`} />
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

      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-gray-700" />
        <span className="text-xs text-gray-500">ou</span>
        <div className="flex-1 border-t border-gray-700" />
      </div>

      <button
        onClick={() => setShowCreate((v) => !v)}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 rounded-lg py-2.5 text-sm transition cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Créer un nouveau patient
      </button>

      {showCreate && (
        <CreatePatientForm
          onCreated={(p) => handleSelect(p)}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

/* ── Create patient inline form ──────────────────────────────── */
function CreatePatientForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", gender: "male", birthDay: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = { ...form };
    if (!payload.birthDay) delete payload.birthDay;
    const res = await createPatient(payload);
    setSubmitting(false);
    if (res.status) {
      onCreated(res.data);
    } else {
      setError(res.message ?? "Une erreur est survenue");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-3">
      <h4 className="text-sm font-semibold text-white">Nouveau patient</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Prénom *</label>
          <input
            type="text" required value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Nom *</label>
          <input
            type="text" required value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Email *</label>
        <input
          type="email" required value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Téléphone *</label>
          <input
            type="tel" required value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Genre *</label>
          <select
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="male">Homme</option>
            <option value="female">Femme</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Date de naissance <span className="text-gray-600">(optionnel)</span></label>
        <input
          type="date" value={form.birthDay}
          onChange={(e) => set("birthDay", e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button" onClick={onCancel}
          className="flex-1 py-2 text-sm text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
        >
          Annuler
        </button>
        <button
          type="submit" disabled={submitting}
          className="flex-1 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition cursor-pointer"
        >
          {submitting ? "Création…" : "Créer le patient"}
        </button>
      </div>
    </form>
  );
}

/* ── Slot picker ──────────────────────────────────────────────── */
function SlotPicker({ doctorId, selectedDate, selectedSlot, onSelect }) {
  const [weekStart, setWeekStart] = useState(todayISO());
  const weekEnd = addDays(weekStart, 6);
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    onSelect(null, null);
    getAvailableSlots(doctorId, weekStart, weekEnd).then((res) => {
      setSlots(res.status ? (res.data?.availableSlots ?? {}) : {});
    }).finally(() => setLoading(false));
  }, [doctorId, weekStart]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevWeek = () => {
    const prev = addDays(weekStart, -7);
    if (prev < todayISO()) return;
    setWeekStart(prev);
  };
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));
  const isFirstWeek = weekStart <= todayISO();
  const sortedDates = Object.keys(slots).sort();

  return (
    <div>
      {/* Week nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevWeek} disabled={isFirstWeek}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer border border-gray-700"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-gray-300 text-xs font-medium">
          {DateUtils.formatDate(weekStart, "fr-FR")} — {DateUtils.formatDate(weekEnd, "fr-FR")}
        </span>
        <button
          onClick={nextWeek}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition cursor-pointer border border-gray-700"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
          <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
          Chargement…
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="text-center py-10">
          <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm">Aucun créneau disponible.</p>
          <button onClick={nextWeek} className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline underline-offset-2 cursor-pointer">
            Semaine suivante →
          </button>
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
                      onClick={() => onSelect(dateKey, slot)}
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
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
function NouveauRdvPage() {
  const { doctor } = useDoctor();

  const businessSites = (doctor?.doctorBusinessSites ?? []).map((dbs) => ({
    id: dbs.businessSite.id,
    name: dbs.businessSite.name,
    ville: dbs.businessSite.ville,
    isPrimary: dbs.isPrimary,
  }));

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedBusinessSiteId, setSelectedBusinessSiteId] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (businessSites.length > 0 && !selectedBusinessSiteId) {
      setSelectedBusinessSiteId(businessSites.find((b) => b.isPrimary)?.id ?? businessSites[0]?.id ?? null);
    }
  }, [doctor]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setSelectedPatient(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setNotes("");
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    const startDT = `${selectedDate}T${selectedSlot.start}:00`;
    const endDT = `${selectedDate}T${selectedSlot.end}:00`;
    const res = await createAppointment(doctor.id, selectedPatient.id, startDT, endDT, notes, selectedBusinessSiteId);
    setSubmitting(false);
    if (res.status) {
      window.dispatchEvent(new Event("scheduled-appointments-updated"));
      setFeedback({ message: res.message ?? "Rendez-vous créé avec succès.", type: "success" });
      resetForm();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setSubmitError(res.message ?? "Une erreur est survenue.");
    }
  };

  const canSubmit = selectedPatient && selectedDate && selectedSlot;

  return (
    <Layout>
      <CabinetLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-white">Nouveau rendez-vous</h2>
            <p className="text-gray-400 mt-1 text-sm">Sélectionnez un patient existant ou créez-en un nouveau, puis choisissez un créneau.</p>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
              feedback.type === "error"
                ? "bg-red-900/50 border border-red-700 text-red-300"
                : "bg-green-900/50 border border-green-700 text-green-300"
            }`}>
              {feedback.type === "success" ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {feedback.message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Left: Patient ── */}
            <div className="space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  Patient
                </h3>

                {selectedPatient ? (
                  <div>
                    <div className="flex items-center gap-3 bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                      <div className={`avatar-user-${selectedPatient.gender || "male"} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                        <div className="text-blue-300 text-xs truncate">{selectedPatient.email}</div>
                        <div className="text-gray-400 text-xs">{selectedPatient.phone}</div>
                      </div>
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="text-gray-500 hover:text-white transition cursor-pointer flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <PatientSearch onSelect={setSelectedPatient} />
                )}
              </div>

              {/* ── Cabinet (si plusieurs) ── */}
              {businessSites.length > 1 && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                    Cabinet
                  </h3>
                  <select
                    value={selectedBusinessSiteId ?? ""}
                    onChange={(e) => setSelectedBusinessSiteId(Number(e.target.value))}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm cursor-pointer"
                  >
                    {businessSites.map((bs) => (
                      <option key={bs.id} value={bs.id}>
                        {bs.name}{bs.ville ? ` — ${bs.ville}` : ""}{bs.isPrimary ? " (principal)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ── Notes ── */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{businessSites.length > 1 ? "3" : "3"}</span>
                  Commentaire <span className="text-gray-600 normal-case font-normal text-xs">(optionnel)</span>
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Motif de consultation, informations importantes…"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* ── Submit ── */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                {submitError && (
                  <p className="text-red-400 text-sm bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-4">
                    {submitError}
                  </p>
                )}

                {/* Recap */}
                {(selectedPatient || selectedSlot) && (
                  <div className="bg-gray-900/50 rounded-lg p-3 mb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className={selectedPatient ? "text-white" : "text-gray-500"}>
                        {selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "Patient non sélectionné"}
                      </span>
                    </div>
                    {businessSites.length > 1 && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className={selectedBusinessSiteId ? "text-white" : "text-gray-500"}>
                          {selectedBusinessSiteId
                            ? businessSites.find((b) => b.id === selectedBusinessSiteId)?.name ?? "Cabinet sélectionné"
                            : "Cabinet non sélectionné"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={selectedSlot ? "text-white" : "text-gray-500"}>
                        {selectedSlot
                          ? `${DateUtils.formatDate(selectedDate, "fr-FR", true)} · ${selectedSlot.start} – ${selectedSlot.end}`
                          : "Créneau non sélectionné"}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition cursor-pointer"
                >
                  {submitting ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {submitting ? "Création en cours…" : "Créer le rendez-vous"}
                </button>
                {!canSubmit && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    {!selectedPatient ? "Sélectionnez un patient" : !selectedSlot ? "Choisissez un créneau" : ""}
                  </p>
                )}
              </div>
            </div>

            {/* ── Right: Slots ── */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{businessSites.length > 1 ? "3" : "2"}</span>
                Créneau disponible
              </h3>
              {doctor?.id ? (
                <SlotPicker
                  doctorId={doctor.id}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSelect={(date, slot) => { setSelectedDate(date); setSelectedSlot(slot); }}
                />
              ) : (
                <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
                  Profil médecin non chargé.
                </div>
              )}
            </div>
          </div>
        </div>
      </CabinetLayout>
    </Layout>
  );
}

export default NouveauRdvPage;
