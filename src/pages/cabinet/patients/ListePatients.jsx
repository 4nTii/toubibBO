import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Layout from "../../../components/Layout/Layout";
import CabinetLayout from "../../../components/Layout/CabinetLayout";
import {
  getMyPatients,
  updatePatient,
  removePatient,
  getPatientAppointments,
  getPatientHistory,
  addPatientHistory,
} from "../../../services/appointmentService";
import TableDraw from "../../../components/TableDraw/TableDraw";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatSocialNumber(number) {
  if (!number) return "";
  const cleaned = number.toString().replace(/\D/g, "").slice(0, 15);
  if (cleaned.length === 0) return "";
  const groups = [1, 2, 2, 2, 3, 3, 2];
  let formatted = "";
  let position = 0;
  for (let i = 0; i < groups.length; i++) {
    const end = position + groups[i];
    if (position < cleaned.length) {
      if (formatted) formatted += " ";
      formatted += cleaned.substring(position, Math.min(end, cleaned.length));
      position = end;
    }
  }
  return formatted;
}

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

function fmtDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_LABELS = {
  scheduled: { label: "Planifié",  cls: "bg-blue-900/40 text-blue-300 border border-blue-700" },
  confirmed: { label: "Confirmé",  cls: "bg-green-900/40 text-green-300 border border-green-700" },
  canceled:  { label: "Annulé",    cls: "bg-red-900/40 text-red-300 border border-red-700" },
  completed: { label: "Passé",     cls: "bg-gray-700 text-gray-400 border border-gray-600" },
};

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] ?? { label: status, cls: "bg-gray-700 text-gray-400" };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.cls}`}>{s.label}</span>
  );
}

const MOCK_DOCS = ["Certificat", "Arrêt maladie oct 2024", "Ordonnance 2025"];

// ─── Modal shell ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        ref={ref}
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] w-full max-w-lg"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 shrink-0">
          <h2 className="text-white font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ patient, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName:    patient.firstName,
    lastName:     patient.lastName,
    birthDay:     patient.birthDay ?? "",
    address:      patient.address ?? "",
    socialNumber: patient.socialNumber ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await updatePatient(patient.id, {
      firstName:    form.firstName,
      lastName:     form.lastName,
      birthDay:     form.birthDay || null,
      address:      form.address  || null,
      socialNumber: form.socialNumber || null,
    });
    setLoading(false);
    if (res?.status) { onSaved(res.data); onClose(); }
    else setError(res?.message ?? "Erreur lors de la mise à jour");
  };

  return (
    <Modal title={`Modifier — ${patient.firstName} ${patient.lastName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="px-3 py-2 rounded bg-red-900/40 border border-red-700 text-red-300 text-sm">{error}</div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom" value={form.firstName} onChange={set("firstName")} required />
          <Field label="Nom" value={form.lastName} onChange={set("lastName")} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de naissance" type="date" value={form.birthDay} onChange={set("birthDay")} />
          <Field
            label="Numéro de sécurité sociale"
            value={formatSocialNumber(form.socialNumber)}
            onChange={(e) => setForm((f) => ({ ...f, socialNumber: e.target.value.replace(/\s/g, "") }))}
            placeholder="1 23 45 67 890 123 12"
            maxLength={20}
          />
        </div>
        <Field label="Adresse" value={form.address} onChange={set("address")} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition text-sm cursor-pointer">
            Annuler
          </button>
          <button type="submit" disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm cursor-pointer">
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, value, onChange, type = "text", required = false, placeholder, maxLength }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}{required && " *"}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
      />
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ patient, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    const res = await removePatient(patient.id);
    setLoading(false);
    if (res?.status) { onDeleted(patient.id); onClose(); }
    else setError(res?.message ?? "Erreur lors de la suppression");
  };

  return (
    <Modal title="Retirer le patient" onClose={onClose}>
      <div className="p-6 space-y-4">
        <p className="text-gray-300 text-sm">
          Voulez-vous retirer <span className="text-white font-medium">{patient.firstName} {patient.lastName}</span> de votre liste de patients ? Le compte ne sera pas supprimé.
        </p>
        {error && (
          <div className="px-3 py-2 rounded bg-red-900/40 border border-red-700 text-red-300 text-sm">{error}</div>
        )}
        <div className="flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition text-sm cursor-pointer">
            Annuler
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm cursor-pointer">
            {loading ? "Suppression…" : "Retirer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── helpers internes ─────────────────────────────────────────────────────────

function InfoItem({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-gray-200 text-sm truncate">{value}</div>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ patient, onClose, onEdit, onDelete }) {
  const [tab, setTab] = useState("appointments");

  // Appointments
  const [appts, setAppts]             = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [filterApptDateFrom, setFilterApptDateFrom] = useState("");
  const [filterApptDateTo,   setFilterApptDateTo]   = useState("");

  // History
  const [hist, setHist]               = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [filterHistDateFrom, setFilterHistDateFrom] = useState("");
  const [filterHistDateTo,   setFilterHistDateTo]   = useState("");

  // Add note
  const [newNote,      setNewNote]      = useState("");
  const [addingNote,   setAddingNote]   = useState(false);
  const [noteError,    setNoteError]    = useState(null);
  const [noteFeedback, setNoteFeedback] = useState(null);

  const fetchAppts = useCallback(async () => {
    setApptLoading(true);
    const res = await getPatientAppointments(patient.id, { page: 1, limit: 200 });
    if (res?.status) setAppts(res.data.appointments ?? []);
    setApptLoading(false);
  }, [patient.id]);

  const fetchHist = useCallback(async () => {
    setHistLoading(true);
    const res = await getPatientHistory(patient.id, { page: 1, limit: 200 });
    if (res?.status) setHist(res.data.history ?? []);
    setHistLoading(false);
  }, [patient.id]);

  useEffect(() => { fetchAppts(); }, [fetchAppts]);
  useEffect(() => { fetchHist(); },  [fetchHist]);

  const filteredAppts = appts.filter((a) => {
    const date = (a.startTime ?? "").slice(0, 10);
    return (
      (!filterApptDateFrom || date >= filterApptDateFrom) &&
      (!filterApptDateTo   || date <= filterApptDateTo)
    );
  });

  const filteredHist = hist.filter((h) => {
    const date = (h.date ?? "").slice(0, 10);
    return (
      (!filterHistDateFrom || date >= filterHistDateFrom) &&
      (!filterHistDateTo   || date <= filterHistDateTo)
    );
  });

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    setNoteError(null);
    try {
      const res = await addPatientHistory(patient.id, { notes: newNote.trim() });
      if (res?.status) {
        setNewNote("");
        setNoteFeedback("Note ajoutée avec succès.");
        setTimeout(() => setNoteFeedback(null), 3000);
        fetchHist();
      } else {
        setNoteError(res?.message ?? "Erreur lors de l'ajout.");
      }
    } catch {
      setNoteError("Erreur réseau.");
    }
    setAddingNote(false);
  };

  /* ── Colonnes rendez-vous ── */
  const apptColumns = useMemo(() => [
    {
      id: "date",
      header: "Date",
      accessorFn: (a) => a.startTime ?? "",
      cell: ({ row: { original: a } }) => (
        <div>
          <div className="text-gray-300 whitespace-nowrap">{fmtDateTime(a.startTime)}</div>
          <div className="text-xs text-gray-500">→ {fmtDateTime(a.endTime)}</div>
        </div>
      ),
    },
    {
      id: "doctor",
      header: "Médecin",
      accessorFn: (a) => `${a.doctorFirstName ?? ""} ${a.doctorLastName ?? ""} ${a.speciality ?? ""}`,
      cell: ({ row: { original: a } }) => (
        <div className="text-gray-300">
          {a.doctorFirstName} {a.doctorLastName}
          {a.speciality && <div className="text-xs text-gray-500">{a.speciality}</div>}
        </div>
      ),
    },
    {
      id: "businessSite",
      header: "Cabinet",
      accessorFn: (a) => a.businessSite ?? "",
      cell: ({ row: { original: a } }) => (
        <span className="text-gray-400 text-xs">{a.businessSite ?? "—"}</span>
      ),
    },
    {
      id: "notes",
      header: "Commentaire",
      accessorFn: (a) => a.notes ?? "",
      cell: ({ row: { original: a } }) => (
        a.notes ? (
          <span className="text-gray-400 text-xs line-clamp-2 max-w-[12rem]">{a.notes}</span>
        ) : (
          <span className="text-gray-600 text-xs">—</span>
        )
      ),
    },
    {
      id: "documents",
      header: "Documents",
      enableSorting: false,
      enableGlobalFilter: false,
      cell: () => (
        <div className="flex flex-wrap gap-1">
          {MOCK_DOCS.map((doc) => (
            <button
              key={doc}
              onClick={() => alert("Fonctionnalité à venir")}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-700 text-blue-400 hover:bg-gray-600 hover:text-blue-300 transition whitespace-nowrap cursor-pointer"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {doc}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "status",
      header: "Statut",
      accessorFn: (a) => a.status ?? "",
      cell: ({ row: { original: a } }) => <StatusBadge status={a.status} />,
    },
  ], []);

  /* ── Colonnes historique ── */
  const histColumns = useMemo(() => [
    {
      id: "date",
      header: "Date",
      accessorFn: (h) => h.date ?? "",
      cell: ({ row: { original: h } }) => (
        <span className="text-gray-300 whitespace-nowrap">{fmtDateTime(h.date)}</span>
      ),
    },
    {
      id: "doctor",
      header: "Médecin",
      accessorFn: (h) => `${h.doctorFirstName ?? ""} ${h.doctorLastName ?? ""} ${h.speciality ?? ""}`,
      cell: ({ row: { original: h } }) => (
        <div className="text-gray-300">
          {h.doctorFirstName} {h.doctorLastName}
          {h.speciality && <div className="text-xs text-gray-500">{h.speciality}</div>}
        </div>
      ),
    },
    {
      id: "notes",
      header: "Notes",
      accessorFn: (h) => h.notes ?? "",
      cell: ({ row: { original: h } }) => (
        <span className="text-gray-400 text-xs">{h.notes ?? <span className="text-gray-600">—</span>}</span>
      ),
    },
  ], []);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-700 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm shrink-0 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <div className="w-px h-6 bg-gray-700 shrink-0" />
        <div className="flex items-center gap-3 min-w-0">
          <div className={`avatar-user-${patient.gender || "male"} w-10 h-10 rounded-full shrink-0`} />
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-base truncate">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-gray-400 text-xs truncate">{patient.email} · {patient.phone}</p>
          </div>
        </div>
        <div className="ml-auto flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(patient)}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-white transition cursor-pointer"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(patient)}
            className="px-3 py-1.5 rounded-lg text-sm bg-red-900/40 hover:bg-red-700 text-white transition cursor-pointer"
          >
            Retirer
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className="px-6 py-3 border-b border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm shrink-0">
        <InfoItem label="Date de naissance"   value={fmt(patient.birthDay)} />
        <InfoItem label="N° sécurité sociale" value={formatSocialNumber(patient.socialNumber) || "—"} />
        <InfoItem label="Adresse"             value={patient.address ?? "—"} />
        <InfoItem label="Inscrit le"          value={fmt(patient.dateInscription)} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 px-6 shrink-0">
        {[
          { key: "appointments", label: "Rendez-vous" },
          { key: "history",      label: "Historique médical" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition -mb-px cursor-pointer ${
              tab === t.key
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Appointments tab ── */}
      {tab === "appointments" && (
        <TableDraw
          data={filteredAppts}
          columns={apptColumns}
          loading={apptLoading}
          pagination
          sorting
          filtering
          pageSize={10}
          compact
          emptyMessage="Aucun rendez-vous trouvé."
          hover
          className="flex flex-col"
          toolbarExtra={
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500 whitespace-nowrap">Du</span>
              <input
                type="date"
                value={filterApptDateFrom}
                onChange={(e) => setFilterApptDateFrom(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">au</span>
              <input
                type="date"
                value={filterApptDateTo}
                onChange={(e) => setFilterApptDateTo(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
              />
              {(filterApptDateFrom || filterApptDateTo) && (
                <button
                  onClick={() => { setFilterApptDateFrom(""); setFilterApptDateTo(""); }}
                  className="text-xs text-gray-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          }
        />
      )}

      {/* ── History tab ── */}
      {tab === "history" && (
        <div className="flex flex-col">
          {/* Ajouter une note */}
          <div className="px-6 py-4 border-b border-gray-700 shrink-0">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Ajouter une note médicale</p>
            {noteFeedback && (
              <div className="mb-2 px-3 py-2 rounded bg-green-900/40 border border-green-700 text-green-300 text-sm">
                {noteFeedback}
              </div>
            )}
            {noteError && (
              <div className="mb-2 px-3 py-2 rounded bg-red-900/40 border border-red-700 text-red-300 text-sm">
                {noteError}
              </div>
            )}
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Saisir une observation, un diagnostic, un traitement…"
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {addingNote ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>

          <TableDraw
            data={filteredHist}
            columns={histColumns}
            loading={histLoading}
            pagination
            sorting
            filtering
            pageSize={10}
            compact
            emptyMessage="Aucun historique médical."
            hover
            className="flex flex-col"
            toolbarExtra={
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-500 whitespace-nowrap">Du</span>
                <input
                  type="date"
                  value={filterHistDateFrom}
                  onChange={(e) => setFilterHistDateFrom(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">au</span>
                <input
                  type="date"
                  value={filterHistDateTo}
                  onChange={(e) => setFilterHistDateTo(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                />
                {(filterHistDateFrom || filterHistDateTo) && (
                  <button
                    onClick={() => { setFilterHistDateFrom(""); setFilterHistDateTo(""); }}
                    className="text-xs text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ListePatients() {
  const [patients, setPatients]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback]   = useState(null);

  const [editPatient,   setEditPatient]   = useState(null);
  const [deletePatient, setDeletePatient] = useState(null);
  const [detailPatient, setDetailPatient] = useState(null);

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    const res = await getMyPatients({ page: 1, limit: 200 });
    if (res?.status) setPatients(res.data.patients);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const patientColumns = useMemo(() => [
    {
      id: "patient",
      header: "Patient",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      cell: ({ row: { original: p } }) => (
        <div className="flex items-center gap-3">
          <div className={`avatar-user-${p.gender || "male"} w-9 h-9 rounded-full shrink-0`} />
          <div className="min-w-0">
            <div className="text-white font-medium truncate">{p.firstName} {p.lastName}</div>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      accessorFn: (row) => `${row.email} ${row.phone ?? ""}`,
      cell: ({ row: { original: p } }) => (
        <div className="min-w-0">
          <div className="text-gray-300 truncate">{p.email}</div>
          <div className="text-gray-400 text-xs">{p.phone}</div>
        </div>
      ),
    },
    {
      id: "birthDay",
      header: "Naissance",
      accessorFn: (row) => row.birthDay ?? "",
      cell: ({ row: { original: p } }) => (
        <span className="text-gray-400 text-xs">{fmt(p.birthDay)}</span>
      ),
    },
    {
      id: "socialNumber",
      header: "N° sécu.",
      accessorFn: (row) => row.socialNumber ?? "",
      cell: ({ row: { original: p } }) => (
        <span className="text-gray-400 text-xs font-mono">
          {formatSocialNumber(p.socialNumber) || "—"}
        </span>
      ),
    },
  ], []);

  const patientActions = useMemo(() => [
    {
      label: "Voir",
      variant: "info",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      onClick: (p) => setDetailPatient(p),
    },
    {
      label: "Modifier",
      variant: "default",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: (p) => setEditPatient(p),
    },
    {
      label: "Retirer",
      variant: "danger",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: (p) => setDeletePatient(p),
    },
  ], []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaved = (updated) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    if (detailPatient?.id === updated.id) setDetailPatient((d) => ({ ...d, ...updated }));
    showFeedback("Patient mis à jour avec succès.");
  };

  const handleDeleted = (id) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    if (detailPatient?.id === id) setDetailPatient(null);
    showFeedback("Patient retiré de votre liste.");
  };

  return (
    <Layout>
      <CabinetLayout>
        {detailPatient ? (
          <DetailPanel
            patient={detailPatient}
            onClose={() => setDetailPatient(null)}
            onEdit={(p) => setEditPatient(p)}
            onDelete={(p) => setDeletePatient(p)}
          />
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Mes patients</h1>
                <p className="text-gray-400 text-sm mt-1">Patients ayant vous comme médecin traitant.</p>
              </div>
              <a
                href="/cabinet/patients/ajouter"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un patient
              </a>
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

            {/* Tableau TanStack */}
            <TableDraw
              data={patients}
              columns={patientColumns}
              actions={patientActions}
              loading={isLoading}
              pagination
              sorting
              filtering
              pageSize={20}
              emptyMessage="Aucun patient trouvé."
              hover
              striped
              onRowClick={(p) => setDetailPatient(p)}
            />
          </div>
        )}

        {/* Modals Edit / Delete */}
        {editPatient && (
          <EditModal
            patient={editPatient}
            onClose={() => setEditPatient(null)}
            onSaved={handleSaved}
          />
        )}
        {deletePatient && (
          <DeleteModal
            patient={deletePatient}
            onClose={() => setDeletePatient(null)}
            onDeleted={handleDeleted}
          />
        )}
      </CabinetLayout>
    </Layout>
  );
}
