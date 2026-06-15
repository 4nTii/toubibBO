# Toubib — Medical Appointment Management Frontend

Toubib is a web application for managing medical appointments. This repository contains the React frontend, which consumes the Toubib REST API.

---

## Tech Stack

- **React 19**
- **Vite 7**
- **React Router DOM 7** — client-side routing
- **Tailwind CSS 4** — utility-first styling
- **TanStack Table v8** — headless table logic (sorting, filtering, pagination, row selection)
- **ESLint 9** — code linting

---

## Requirements

- Node.js >= 18
- npm

---

## Install Requirements
- Docker _(https://www.docker.com/get-started/)_
- Make _(https://gnuwin32.sourceforge.net/packages/make.htm)_

---

## Installation

Clone the repository then run:

```bash
make
```

This command runs in order:

1. `make setup` — installs npm dependencies
2. `make dev` — starts the Vite development server

---

## Available Commands

| Command        | Description                |
| -------------- | -------------------------- |
| `make`         | Full setup + npm run dev   |
| `make setup`   | `npm install`              |
| `make install` | `npm install` only         |
| `make dev`     | Starts the Vite dev server |

---

## npm Scripts

| Script            | Description                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Starts the development server         |
| `npm run build`   | Builds the app for production         |
| `npm run preview` | Previews the production build locally |
| `npm run lint`    | Runs ESLint                           |

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── TableDraw/          # Generic TanStack Table wrapper
│   │   │   ├── TableDraw.jsx           — main component
│   │   │   ├── TableDrawToolbar.jsx    — global search + extra filters slot
│   │   │   ├── TableDrawPagination.jsx — page navigation + page-size selector
│   │   │   └── TableDrawSkeleton.jsx   — animated loading skeleton
│   │   └── ...
│   ├── pages/
│   ├── services/
│   └── ...
├── public/           # Static assets
├── index.html
├── vite.config.js
├── Makefile
└── package.json
```

---

## TableDraw Component

`TableDraw` is a reusable table component built on top of TanStack Table v8. It handles sorting, global filtering, pagination, row selection, loading skeletons, and empty states.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `Array` | `[]` | Rows to display |
| `columns` | `Array` | `[]` | TanStack column definitions (`accessorKey`, `accessorFn`, `cell`, `header`) |
| `loading` | `boolean` | `false` | Shows animated skeleton rows |
| `pagination` | `boolean` | `true` | Enables client-side pagination |
| `sorting` | `boolean` | `true` | Enables column sorting |
| `filtering` | `boolean` | `true` | Enables global text search |
| `rowSelection` | `boolean` | `false` | Shows checkbox column with select-all |
| `pageSize` | `number` | `10` | Default rows per page |
| `emptyMessage` | `string` | `"Aucune donnée trouvée"` | Message shown when data is empty |
| `striped` | `boolean` | `false` | Alternating row background |
| `hover` | `boolean` | `true` | Row highlight on hover |
| `bordered` | `boolean` | `false` | Cell borders |
| `compact` | `boolean` | `false` | Reduced cell padding |
| `actions` | `Array` | `[]` | `[{ label, onClick, variant?, icon? }]` — appends an Actions column. Variants: `info`, `danger`, `default` |
| `onRowClick` | `Function` | — | Called with `row.original` on row click |
| `toolbarExtra` | `ReactNode` | — | Extra content rendered in the toolbar row alongside the search bar (e.g. date range pickers) |
| `className` | `string` | card style | CSS classes for the outer wrapper |

### Example

```jsx
<TableDraw
  data={patients}
  columns={patientColumns}
  actions={[
    { label: "Voir", variant: "info", onClick: (p) => openDetail(p) },
    { label: "Retirer", variant: "danger", onClick: (p) => remove(p) },
  ]}
  loading={isLoading}
  pagination
  sorting
  filtering
  pageSize={20}
  striped
  hover
  emptyMessage="Aucun patient trouvé."
  onRowClick={(p) => openDetail(p)}
/>
```

---

## API

This frontend connects to the Toubib Symfony API. Make sure the backend is running before starting the frontend. The API base URL is configured via the `API_URL` variable in `src/config/config.js`.

---

## License

Yassine ECHCHOUROUQ — all rights reserved.
