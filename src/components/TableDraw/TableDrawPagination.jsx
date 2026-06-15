/**
 * TableDrawPagination — pied de tableau avec navigation entre pages.
 * Reçoit l'instance `table` de TanStack et gère la pagination cliente.
 */

function PageBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="min-w-[1.75rem] h-7 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
    >
      {children}
    </button>
  );
}

export default function TableDrawPagination({ table }) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalRows  = table.getFilteredRowModel().rows.length;

  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end   = Math.min((pageIndex + 1) * pageSize, totalRows);

  /* fenêtre de ±2 pages autour de la page courante */
  const pages = Array.from({ length: pageCount }, (_, i) => i).filter(
    (p) => Math.abs(p - pageIndex) <= 2
  );

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700 text-xs text-gray-400 flex-wrap gap-2">
      {/* Plage visible */}
      <span>
        {start}–{end} sur {totalRows}
      </span>

      {/* Boutons de navigation */}
      {pageCount > 1 && (
        <div className="flex items-center gap-0.5">
          <PageBtn onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            «
          </PageBtn>
          <PageBtn onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            ‹
          </PageBtn>

          {/* Ellipsis gauche */}
          {pages[0] > 0 && (
            <span className="px-1 text-gray-600">…</span>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => table.setPageIndex(p)}
              className={`min-w-[1.75rem] h-7 rounded text-xs transition cursor-pointer ${
                p === pageIndex
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-gray-600"
              }`}
            >
              {p + 1}
            </button>
          ))}

          {/* Ellipsis droite */}
          {pages[pages.length - 1] < pageCount - 1 && (
            <span className="px-1 text-gray-600">…</span>
          )}

          <PageBtn onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            ›
          </PageBtn>
          <PageBtn
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            »
          </PageBtn>
        </div>
      )}

      {/* Sélecteur de taille de page */}
      <select
        value={pageSize}
        onChange={(e) => {
          table.setPageSize(Number(e.target.value));
          table.setPageIndex(0);
        }}
        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300 text-xs focus:outline-none cursor-pointer"
      >
        {[5, 10, 20, 50, 100].map((s) => (
          <option key={s} value={s}>
            {s} / page
          </option>
        ))}
      </select>
    </div>
  );
}
