# Toubib — Medical Appointment Management Frontend

Toubib is a web application for managing medical appointments. This repository contains the React frontend, which consumes the Toubib REST API.

---

## Tech Stack

- **React 19**
- **Vite 7**
- **React Router DOM 7** — client-side routing
- **Tailwind CSS 4** — utility-first styling
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
├── src/              # Application source code
├── public/           # Static assets
├── index.html
├── vite.config.js
├── Makefile
└── package.json
```

---

## API

This frontend connects to the Toubib Symfony API. Make sure the backend is running before starting the frontend. The API base URL is configured via the `API_URL` variable in `src/config/config.js`.

---

## License

Yassine ECHCHOUROUQ — all rights reserved.
