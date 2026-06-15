/**
 * TableDrawToolbar — barre d'outils au-dessus du tableau.
 * Contient la recherche globale et les infos de sélection / comptage.
 */

export default function TableDrawToolbar({
  filtering,
  globalFilter,
  onGlobalFilterChange,
  selectedCount,
  totalCount,
  extra,
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-700 flex-wrap">
      {extra}

      {/* Champ de recherche globale */}
      {filtering && (
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            placeholder="Rechercher…"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-8 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {/* Bouton effacer */}
          {globalFilter && (
            <button
              onClick={() => onGlobalFilterChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition cursor-pointer leading-none"
              aria-label="Effacer la recherche"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Compteur et sélection */}
      <div className="ml-auto flex items-center gap-3 text-xs text-gray-500 whitespace-nowrap shrink-0">
        {selectedCount > 0 && (
          <span className="text-blue-400 font-medium">
            {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
          </span>
        )}
        <span>{totalCount} résultat{totalCount > 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
