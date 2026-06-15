/**
 * TableDraw — composant tableau générique basé sur TanStack Table v8.
 *
 * Props
 * ─────
 * data          {Array}    Données à afficher
 * columns       {Array}    Définitions de colonnes TanStack (accessorKey / accessorFn / cell / header)
 * loading       {boolean}  Affiche le skeleton si vrai
 * pagination    {boolean}  Active la pagination cliente (défaut : true)
 * sorting       {boolean}  Active le tri (défaut : true)
 * filtering     {boolean}  Active le filtre global (défaut : true)
 * rowSelection  {boolean}  Affiche la colonne de cases à cocher (défaut : false)
 * pageSize      {number}   Lignes par page par défaut (défaut : 10)
 * emptyMessage  {string}   Message si aucune donnée
 * striped       {boolean}  Alternance de couleur sur les lignes (défaut : false)
 * hover         {boolean}  Effet survol sur les lignes (défaut : true)
 * bordered      {boolean}  Bordures sur les cellules (défaut : false)
 * compact       {boolean}  Réduction du padding des cellules (défaut : false)
 * actions       {Array}    [{label, onClick, variant?, icon?}] — colonne Actions
 * onRowClick    {Function} Callback appelé avec row.original au clic sur une ligne
 */

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import TableDrawSkeleton   from "./TableDrawSkeleton";
import TableDrawToolbar    from "./TableDrawToolbar";
import TableDrawPagination from "./TableDrawPagination";

/* ── Icône de tri ─────────────────────────────────────────────── */
function SortIcon({ direction }) {
  if (!direction) {
    return (
      <svg className="w-3 h-3 opacity-25 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return direction === "asc" ? (
    <svg className="w-3 h-3 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3 h-3 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/* ── État vide ────────────────────────────────────────────────── */
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-gray-500">
      <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <span className="text-sm">{message}</span>
    </div>
  );
}

/* ── Composant principal ──────────────────────────────────────── */
export default function TableDraw({
  data          = [],
  columns       = [],
  loading       = false,
  pagination    = true,
  sorting       = true,
  filtering     = true,
  rowSelection  = false,
  pageSize      = 10,
  emptyMessage  = "Aucune donnée trouvée",
  striped       = false,
  hover         = true,
  bordered      = false,
  compact       = false,
  actions       = [],
  onRowClick,
  toolbarExtra,
  className     = "bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col",
}) {
  /* ── State TanStack ── */
  const [sortingState,      setSortingState]      = useState([]);
  const [globalFilter,      setGlobalFilter]      = useState("");
  const [rowSelectionState, setRowSelectionState] = useState({});
  const [paginationState,   setPaginationState]   = useState({ pageIndex: 0, pageSize });

  /* ── Construction des colonnes finales ── */
  const finalColumns = useMemo(() => {
    const cols = [];

    /* Colonne de sélection (checkbox) */
    if (rowSelection) {
      cols.push({
        id: "__select__",
        size: 44,
        enableSorting: false,
        enableGlobalFilter: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Tout sélectionner"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 accent-blue-500 cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label="Sélectionner la ligne"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 accent-blue-500 cursor-pointer disabled:opacity-40"
          />
        ),
      });
    }

    /* Colonnes utilisateur */
    cols.push(...columns);

    /* Colonne actions */
    if (actions.length > 0) {
      cols.push({
        id: "__actions__",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => null,
        cell: ({ row }) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => action.onClick(row.original)}
                title={action.label}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  action.variant === "danger"
                    ? "bg-red-900/50 text-white hover:bg-red-700"
                    : action.variant === "info"
                    ? "bg-blue-900/50 text-white hover:bg-blue-700"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                }`}
              >
                {action.icon && <span className="shrink-0">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        ),
      });
    }

    return cols;
  }, [columns, rowSelection, actions]);

  /* ── Instance TanStack Table ── */
  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting:      sortingState,
      globalFilter,
      rowSelection: rowSelectionState,
      pagination:   paginationState,
    },
    onSortingChange:      setSortingState,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelectionState,
    onPaginationChange:   setPaginationState,

    getCoreRowModel:       getCoreRowModel(),
    ...(sorting    ? { getSortedRowModel:     getSortedRowModel()     } : {}),
    ...(filtering  ? { getFilteredRowModel:   getFilteredRowModel()   } : {}),
    ...(pagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),

    enableRowSelection: rowSelection,
    enableSorting:      sorting,
    enableGlobalFilter: filtering,
  });

  /* ── Lignes à afficher ── */
  const rows = pagination
    ? table.getPaginationRowModel().rows
    : table.getRowModel().rows;

  const selectedCount = Object.keys(rowSelectionState).length;
  const totalFiltered = filtering
    ? table.getFilteredRowModel().rows.length
    : data.length;

  /* ── Classes dynamiques ── */
  const cellPad = compact ? "px-4 py-2" : "px-4 py-3.5";

  function rowCls(index) {
    const parts = ["transition-colors"];
    if (hover)                 parts.push(onRowClick ? "cursor-pointer" : "", "hover:bg-gray-700/40");
    if (striped && index % 2)  parts.push("bg-gray-800/60");
    if (bordered)              parts.push("border-b border-gray-700");
    else                       parts.push("border-b border-gray-700/50");
    return parts.join(" ");
  }

  const showToolbar = filtering || (rowSelection && selectedCount > 0) || !!toolbarExtra;

  return (
    <div className={className}>

      {/* ── Toolbar ── */}
      {showToolbar && (
        <TableDrawToolbar
          filtering={filtering}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          selectedCount={selectedCount}
          totalCount={totalFiltered}
          extra={toolbarExtra}
        />
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">

          {/* En-têtes */}
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`text-left ${cellPad} whitespace-nowrap select-none ${
                      header.column.getCanSort()
                        ? "cursor-pointer hover:text-gray-200 transition-colors"
                        : ""
                    }`}
                    style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : undefined }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {!header.isPlaceholder && (
                      <span className="inline-flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <SortIcon direction={header.column.getIsSorted()} />
                        )}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Corps */}
          <tbody>
            {loading ? (
              /* Skeleton */
              <TableDrawSkeleton
                columnCount={finalColumns.length}
                rowCount={Math.min(pageSize, 8)}
                compact={compact}
              />
            ) : rows.length === 0 ? (
              /* État vide */
              <tr>
                <td colSpan={finalColumns.length} className="py-16 text-center">
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            ) : (
              /* Données */
              rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={rowCls(i)}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={`${cellPad} text-gray-300`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination && !loading && data.length > 0 && (
        <TableDrawPagination table={table} />
      )}
    </div>
  );
}
