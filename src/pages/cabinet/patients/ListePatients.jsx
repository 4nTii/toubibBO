import { useState, useEffect, useCallback, useRef } from "react";
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

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, total, label, onPage }) {
  if (totalPages <= 1 && total === 0) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700 text-xs text-gray-400">
      <span>{total} {label}{total > 1 ? "s" : ""} — page {page}/{totalPages || 1}</span>
      <div className="flex gap-1">
        <PagBtn onClick={() => onPage(1)} disabled={page === 1} label="«" />
        <PagBtn onClick={() => onPage(page - 1)} disabled={page === 1} label="‹" />
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => Math.abs(p - page) <= 2)
          .map((p) => (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`min-w-[2rem] h-7 rounded text-xs transition ${
                p === page ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-600"
              }`}
            >
              {p}
            </button>
          ))}
        <PagBtn onClick={() => onPage(page + 1)} disabled={page === totalPages} label="›" />
        <PagBtn onClick={() => onPage(totalPages)} disabled={page === totalPages} label="»" />
      </div>
    </div>
  );
}

function PagBtn({ onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 rounded text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs"
    >
      {label}
    </button>
  );
}

// ─── Select filter ────────────────────────────────────────────────────────────

function FilterSelect({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-700 border border-gray-600 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

// ─── Modal shell (Edit / Delete only) ────────────────────────────────────────

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
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
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

function LoadingRow() {
  return (
    <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Chargement…
    </div>
  );
}

function EmptyRow({ msg }) {
  return <div className="text-center py-12 text-gray-500 text-sm">{msg}</div>;
}

// ─── Detail panel (inline, 100% de la div content) ───────────────────────────

function DetailPanel({ patient, onClose, onEdit, onDelete }) {
  const [tab, setTab] = useState("appointments");

  // Appointments
  const [appts, setAppts]         = useState([]);
  const [apptPage, setApptPage]   = useState(1);
  const [apptMeta, setApptMeta]   = useState({ total: 0, totalPages: 1 });
  const [apptLoading, setApptLoading] = useState(false);
  const [filterApptDoctor,   setFilterApptDoctor]   = useState("");
  const [filterApptSpec,     setFilterApptSpec]     = useState("");
  const [filterApptDateFrom, setFilterApptDateFrom] = useState("");
  const [filterApptDateTo,   setFilterApptDateTo]   = useState("");

  // History
  const [hist, setHist]           = useState([]);
  const [histPage, setHistPage]   = useState(1);
  const [histMeta, setHistMeta]   = useState({ total: 0, totalPages: 1 });
  const [histLoading, setHistLoading] = useState(false);
  const [filterHistDoctor,   setFilterHistDoctor]   = useState("");
  const [filterHistSpec,     setFilterHistSpec]     = useState("");
  const [filterHistDateFrom, setFilterHistDateFrom] = useState("");
  const [filterHistDateTo,   setFilterHistDateTo]   = useState("");

  // Add note
  const [newNote,      setNewNote]      = useState("");
  const [addingNote,   setAddingNote]   = useState(false);
  const [noteError,    setNoteError]    = useState(null);
  const [noteFeedback, setNoteFeedback] = useState(null);

  const fetchAppts = useCallback(async (p) => {
    setApptLoading(true);
    const res = await getPatientAppointments(patient.id, { page: p });
    if (res?.status) {
      setAppts(res.data.appointments ?? []);
      setApptMeta({ total: res.data.total, totalPages: res.data.totalPages });
    }
    setApptLoading(false);
  }, [patient.id]);

  const fetchHist = useCallback(async (p) => {
    setHistLoading(true);
    const res = await getPatientHistory(patient.id, { page: p });
    if (res?.status) {
      setHist(res.data.history ?? []);
      setHistMeta({ total: res.data.total, totalPages: res.data.totalPages });
    }
    setHistLoading(false);
  }, [patient.id]);

  useEffect(() => { fetchAppts(apptPage); }, [fetchAppts, apptPage]);
  useEffect(() => { fetchHist(histPage); },  [fetchHist,  histPage]);

  // Derived filter options
  const apptDoctors = [...new Set(appts.map((a) => `${a.doctorFirstName ?? ""} ${a.doctorLastName ?? ""}`.trim()).filter(Boolean))];
  const apptSpecs   = [...new Set(appts.map((a) => a.speciality).filter(Boolean))];
  const histDoctors = [...new Set(hist.map((h)  => `${h.doctorFirstName ?? ""} ${h.doctorLastName ?? ""}`.trim()).filter(Boolean))];
  const histSpecs   = [...new Set(hist.map((h)  => h.speciality).filter(Boolean))];

  const filteredAppts = appts.filter((a) => {
    const doc  = `${a.doctorFirstName ?? ""} ${a.doctorLastName ?? ""}`.trim();
    const date = (a.startTime ?? "").slice(0, 10);
    return (
      (!filterApptDoctor   || doc  === filterApptDoctor) &&
      (!filterApptSpec     || (a.speciality ?? "") === filterApptSpec) &&
      (!filterApptDateFrom || date >= filterApptDateFrom) &&
      (!filterApptDateTo   || date <= filterApptDateTo)
    );
  });

  const filteredHist = hist.filter((h) => {
    const doc  = `${h.doctorFirstName ?? ""} ${h.doctorLastName ?? ""}`.trim();
    const date = (h.date ?? "").slice(0, 10);
    return (
      (!filterHistDoctor   || doc  === filterHistDoctor) &&
      (!filterHistSpec     || (h.speciality ?? "") === filterHistSpec) &&
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
        fetchHist(histPage);
      } else {
        setNoteError(res?.message ?? "Erreur lors de l'ajout.");
      }
    } catch {
      setNoteError("Erreur réseau.");
    }
    setAddingNote(false);
  };

  const selectCls = "bg-gray-700 border border-gray-600 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer";

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
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 transition cursor-pointer"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(patient)}
            className="px-3 py-1.5 rounded-lg text-sm bg-red-900/40 hover:bg-red-700 text-red-300 hover:text-white transition cursor-pointer"
          >
            Retirer
          </button>
        </div>
      </div>

      {/* Info strip */}
      <div className="px-6 py-3 border-b border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm shrink-0">
        <InfoItem label="Date de naissance"     value={fmt(patient.birthDay)} />
        <InfoItem label="N° sécurité sociale"   value={formatSocialNumber(patient.socialNumber) || "—"} />
        <InfoItem label="Adresse"               value={patient.address ?? "—"} />
        <InfoItem label="Inscrit le"            value={fmt(patient.dateInscription)} />
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
            className={`py-3 px-4 text-sm font-medium border-b-2 transition -mb-px ${
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
        <div className="flex flex-col min-h-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-gray-700 shrink-0">
            <FilterSelect
              value={filterApptDoctor}
              onChange={setFilterApptDoctor}
              placeholder="Tous les médecins"
              options={apptDoctors}
            />
            <FilterSelect
              value={filterApptSpec}
              onChange={setFilterApptSpec}
              placeholder="Toutes les spécialités"
              options={apptSpecs}
            />
            <div className="flex items-center gap-2">
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
            </div>
            {(filterApptDoctor || filterApptSpec || filterApptDateFrom || filterApptDateTo) && (
              <button
                onClick={() => { setFilterApptDoctor(""); setFilterApptSpec(""); setFilterApptDateFrom(""); setFilterApptDateTo(""); }}
                className="text-xs text-gray-400 hover:text-white transition cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            {apptLoading ? (
              <LoadingRow />
            ) : filteredAppts.length === 0 ? (
              <EmptyRow msg="Aucun rendez-vous trouvé." />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
                    <th className="text-left px-6 py-3">Date</th>
                    <th className="text-left px-6 py-3">Médecin</th>
                    <th className="text-left px-6 py-3">Cabinet</th>
                    <th className="text-left px-6 py-3">Commentaire</th>
                    <th className="text-left px-6 py-3">Documents</th>
                    <th className="text-left px-6 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredAppts.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-3 text-gray-300 whitespace-nowrap">
                        <div>{fmtDateTime(a.startTime)}</div>
                        <div className="text-xs text-gray-500">→ {fmtDateTime(a.endTime)}</div>
                      </td>
                      <td className="px-6 py-3 text-gray-300">
                        {a.doctorFirstName} {a.doctorLastName}
                        {a.speciality && (
                          <div className="text-xs text-gray-500">{a.speciality}</div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs">{a.businessSite ?? "—"}</td>
                      <td className="px-6 py-3 text-gray-400 text-xs max-w-[12rem]">
                        {a.notes ? (
                          <span className="line-clamp-2">{a.notes}</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
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
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Pagination
            page={apptPage}
            totalPages={apptMeta.totalPages}
            total={apptMeta.total}
            label="rendez-vous"
            onPage={(p) => setApptPage(p)}
          />
        </div>
      )}

      {/* ── History tab ── */}
      {tab === "history" && (
        <div className="flex flex-col min-h-0">
          {/* Add note form */}
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

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-gray-700 shrink-0">
            <FilterSelect
              value={filterHistDoctor}
              onChange={setFilterHistDoctor}
              placeholder="Tous les médecins"
              options={histDoctors}
            />
            <FilterSelect
              value={filterHistSpec}
              onChange={setFilterHistSpec}
              placeholder="Toutes les spécialités"
              options={histSpecs}
            />
            <div className="flex items-center gap-2">
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
            </div>
            {(filterHistDoctor || filterHistSpec || filterHistDateFrom || filterHistDateTo) && (
              <button
                onClick={() => { setFilterHistDoctor(""); setFilterHistSpec(""); setFilterHistDateFrom(""); setFilterHistDateTo(""); }}
                className="text-xs text-gray-400 hover:text-white transition cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            {histLoading ? (
              <LoadingRow />
            ) : filteredHist.length === 0 ? (
              <EmptyRow msg="Aucun historique médical." />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
                    <th className="text-left px-6 py-3">Date</th>
                    <th className="text-left px-6 py-3">Médecin</th>
                    <th className="text-left px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredHist.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-3 text-gray-300 whitespace-nowrap">{fmtDateTime(h.date)}</td>
                      <td className="px-6 py-3 text-gray-300">
                        {h.doctorFirstName} {h.doctorLastName}
                        {h.speciality && (
                          <div className="text-xs text-gray-500">{h.speciality}</div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs max-w-xs">
                        {h.notes ?? <span className="text-gray-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Pagination
            page={histPage}
            totalPages={histMeta.totalPages}
            total={histMeta.total}
            label="entrée"
            onPage={(p) => setHistPage(p)}
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
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [meta, setMeta]           = useState({ total: 0, totalPages: 1 });
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
    const res = await getMyPatients({ page, limit: 20 });
    if (res?.status) {
      setPatients(res.data.patients);
      setMeta({ total: res.data.total, totalPages: res.data.totalPages });
    }
    setIsLoading(false);
  }, [page]);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const filtered = search.trim()
    ? patients.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.phone && p.phone.includes(q))
        );
      })
    : patients;

  const handleSaved = (updated) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    if (detailPatient?.id === updated.id) setDetailPatient((d) => ({ ...d, ...updated }));
    showFeedback("Patient mis à jour avec succès.");
  };

  const handleDeleted = (id) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setMeta((m) => ({ ...m, total: m.total - 1 }));
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

            {/* Search */}
            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Chargement…
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  {search ? "Aucun patient ne correspond à votre recherche." : "Aucun patient trouvé."}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Patient</th>
                      <th className="text-left px-6 py-3">Contact</th>
                      <th className="text-left px-6 py-3 hidden md:table-cell">Naissance</th>
                      <th className="text-left px-6 py-3 hidden lg:table-cell">N° sécu.</th>
                      <th className="text-right px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filtered.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-700/30 transition cursor-pointer"
                        onClick={() => setDetailPatient(p)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`avatar-user-${p.gender || "male"} w-9 h-9 rounded-full shrink-0`} />
                            <div className="min-w-0">
                              <div className="text-white font-medium truncate">{p.firstName} {p.lastName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 min-w-0">
                          <div className="text-gray-300 truncate">{p.email}</div>
                          <div className="text-gray-400 text-xs">{p.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs hidden md:table-cell">{fmt(p.birthDay)}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs font-mono hidden lg:table-cell">{formatSocialNumber(p.socialNumber) || "—"}</td>
                        <td className="px-6 py-4">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                              <ActionBtn title="Voir les détails" variant="info" onClick={() => setDetailPatient(p)}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </ActionBtn>
                              <ActionBtn title="Modifier" variant="default" onClick={() => setEditPatient(p)}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </ActionBtn>
                              <ActionBtn title="Retirer de la liste" variant="danger" onClick={() => setDeletePatient(p)}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </ActionBtn>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {!isLoading && !search && (
                <Pagination
                  page={page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  label="patient"
                  onPage={(p) => setPage(p)}
                />
              )}
            </div>
          </div>
        )}

        {/* Modals Edit / Delete (restent en overlay) */}
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

function ActionBtn({ title, onClick, variant = "default", children }) {
  const variants = {
    default: "text-gray-400 hover:text-white hover:bg-gray-600",
    danger:  "text-red-400 hover:text-white hover:bg-red-600",
    info:    "text-blue-400 hover:text-white hover:bg-blue-600",
  };
  return (
    <button
      title={title}
      onClick={onClick}
      className={`relative group p-2 rounded-lg transition-all duration-200 cursor-pointer ${variants[variant]}`}
    >
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700 z-10">
        {title}
      </span>
    </button>
  );
}
