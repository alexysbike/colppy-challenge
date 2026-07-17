# Colppy Challenge — Sales Dashboard

Dashboard de ventas para el challenge técnico de Colppy. Monorepo con API REST en Node.js y SPA en React.

---

## Español

### Descripción

Aplicación full-stack para consultar, crear e importar ventas. Incluye KPIs por período, listado paginado, alta manual e importación masiva desde CSV.

### Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| **Node.js** | 20.19+ (o 22.12+) |
| **npm**     | 10+             |

No se requiere Docker ni servicios externos: la base de datos es SQLite local.

### Inicio rápido (desde cero)

```bash
# 1. Instalar dependencias (raíz, backend y frontend) y crear frontend/.env
npm run setup

# 2. Levantar backend + frontend en paralelo
npm run dev
```

| Servicio   | URL                          |
|------------|------------------------------|
| Frontend   | http://localhost:5173        |
| API        | http://localhost:3000        |
| Swagger UI | http://localhost:3000/doc    |
| Health     | http://localhost:3000/health |

El backend ejecuta las migraciones de base de datos automáticamente al iniciar. La base SQLite se crea en `backend/data/app.db`.

### Scripts disponibles (raíz)

| Script | Descripción |
|--------|-------------|
| `npm run setup` | Instala dependencias en los tres niveles y genera `frontend/.env` si no existe |
| `npm run dev` | Inicia backend (puerto 3000) y frontend (puerto 5173) en paralelo |
| `npm run dev:backend` | Solo API |
| `npm run dev:frontend` | Solo SPA |
| `npm run build` | Compila backend y frontend |
| `npm run db:migrate` | Ejecuta migraciones manualmente (opcional; el arranque ya las aplica) |
| `npm run test` | Tests del backend (Jest) |
| `npm run lint` | ESLint en backend y frontend |
| `npm run validate` | Lint + tests + build del backend, lint + build del frontend |

Scripts adicionales en cada paquete: ver `backend/package.json` y `frontend/package.json`.

### Variables de entorno

**Frontend** (`frontend/.env`, generado desde `.env.example`):

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `VITE_API_BASE_URL` | `/api` | Base URL de la API. En desarrollo apunta al proxy de Vite |
| `VITE_API_PROXY_TARGET` | `http://localhost:3000` | Destino del proxy `/api` → backend |

**Backend** (opcionales; valores por defecto en código):

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto HTTP |
| `DATABASE_PATH` | `./data/app.db` | Ruta del archivo SQLite |
| `NODE_ENV` | `development` | Entorno de ejecución |
| `LOG_LEVEL` | `debug` (dev) | Nivel de logs Pino |

### Datos de ejemplo (CSV)

Archivos de prueba en `backend/fixtures/`:

- `ventas_2026-05.csv` — dataset principal de mayo 2026
- `ventas-with-quotes.csv` — campos entre comillas
- `ventas-partial-errors.csv` — filas con errores parciales
- `ventas-invalid-header.csv` — cabecera inválida (error 400)

Formato esperado del CSV:

```csv
id_venta,fecha,cliente,producto,cantidad,importe,medio_pago
```

### Stack tecnológico — ¿por qué?

#### Backend

| Tecnología | Motivo |
|------------|--------|
| **TypeScript** | Tipado estático compartido con el frontend; menos errores en contratos API |
| **Express 5** | Framework HTTP maduro y mínimo; queda en el borde de la arquitectura (adaptador) |
| **SQLite + Drizzle ORM** | Cero configuración para evaluar el challenge; esquema tipado, migraciones versionadas, sin dependencia de Docker |
| **Zod** | Una sola fuente de verdad para validación de entrada y generación de OpenAPI |
| **Clean Architecture (ligera)** | Casos de uso testeables, puertos de repositorio, framework desacoplado del dominio |
| **Jest + Supertest** | Tests unitarios de casos de uso e integración HTTP del contrato completo |
| **Pino** | Logging estructurado con bajo overhead |
| **better-sqlite3** | Driver síncrono eficiente para SQLite en procesos Node.js |

#### Frontend

| Tecnología | Motivo |
|------------|--------|
| **React 19 + Vite** | DX rápida (HMR), build moderno, ecosistema estándar |
| **TypeScript** | Alineado con el backend y con los tipos del contrato API |
| **Tailwind CSS v4** | Estilos utilitarios sin salir del JSX; integración nativa con Vite |
| **Flowbite React** | Componentes accesibles (tablas, modales, formularios) listos para un dashboard |
| **Capa HTTP propia (`HttpService` + `Api`)** | Abstracción portable sobre `fetch`; hooks desacoplados del transporte |
| **React Context** | Estado global de UI (período, filtros) sin librerías extra para el alcance del challenge |
| **Sin router** | Una sola pantalla con secciones; menos complejidad para el alcance funcional |

#### Decisiones transversales

| Tema | Decisión |
|------|----------|
| **Montos** | Strings decimales (`"18500.00"`) para evitar errores de punto flotante |
| **Fechas** | ISO 8601 (`YYYY-MM-DD`) |
| **Idempotencia** | `externalId` único; reenvío con mismos datos no duplica |
| **CORS en dev** | Proxy de Vite (`/api` → `localhost:3000`) en lugar de configurar CORS en el backend |
| **OpenAPI** | Generado al arrancar; documentación interactiva en `/doc` |

### Arquitectura

La documentación detallada vive en `specs/`:

| Documento | Contenido |
|-----------|-----------|
| [specs/backend-architecture.md](./specs/backend-architecture.md) | Capas, carpetas, casos de uso, testing |
| [specs/frontend-architecture.md](./specs/frontend-architecture.md) | Capa HTTP, hooks, contexto, UI |
| [specs/endpoints.md](./specs/endpoints.md) | Contrato REST (request/response, códigos HTTP) |
| [specs/models.md](./specs/models.md) | Modelo `Sale`, validaciones, idempotencia |

#### Vista general

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React SPA)                                       │
│  Dashboard · Flowbite · hooks de API · Context              │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP (proxy /api en dev)
┌───────────────────────────▼─────────────────────────────────┐
│  Backend (Express)                                          │
│  Routes → Use Cases → Domain ← Drizzle (SQLite)             │
└─────────────────────────────────────────────────────────────┘
```

**Backend:** dominio puro → casos de uso → infraestructura (Drizzle, CSV, Express) → presentación (rutas, Zod, OpenAPI).

**Frontend:** pantalla única → hooks por endpoint → capa `Api`/`HttpService` → backend.

### Estructura del proyecto

```
colppy-challenge/
├── backend/          # API REST (Express + Drizzle + SQLite)
├── frontend/         # SPA (React + Vite + Tailwind + Flowbite)
├── specs/            # Especificaciones de arquitectura y contrato
├── scripts/          # Utilidades del monorepo (setup de entorno)
├── package.json      # Scripts de orquestación
└── README.md
```

### Flujo de desarrollo típico

1. `npm run setup` — primera vez o tras clonar
2. `npm run dev` — desarrollo diario
3. `npm run validate` — antes de entregar o abrir PR
4. Importar `backend/fixtures/ventas_2026-05.csv` desde la UI para poblar datos

### Fuera del alcance

Funcionalidades deliberadamente excluidas del challenge para mantener el foco en el núcleo del dashboard:

| Área | Qué no está incluido |
|------|----------------------|
| **Seguridad** | Autenticación y autorización |
| **Operaciones** | Docker, despliegue y configuración de producción |
| **Ventas** | Edición y eliminación de ventas |
| **Ventas** | Búsqueda por texto (cliente, producto, etc.) |
| **API** | GraphQL o tRPC |
| **Frontend** | Routing con React Router u otro router |
| **Frontend** | Estado global externo (Redux, Jotai, Zustand, etc.) |
| **Frontend** | Implementación Axios (solo `FetchHttpService`) |
| **Frontend** | Ajustes responsive (mobile/tablet) |
| **Testing** | Tests E2E (Playwright, Cypress) |
| **i18n** | Framework de internacionalización (textos en español fijos) |

Detalle adicional en [specs/backend-architecture.md](./specs/backend-architecture.md) y [specs/frontend-architecture.md](./specs/frontend-architecture.md).

---

## English

### Description

Full-stack sales dashboard for the Colppy technical challenge. REST API in Node.js and React SPA.

### Requirements

| Tool | Minimum version |
|------|-----------------|
| **Node.js** | 20.19+ (or 22.12+) |
| **npm** | 10+ |

No Docker or external services required: the database is local SQLite.

### Quick start (from scratch)

```bash
# 1. Install dependencies (root, backend, frontend) and create frontend/.env
npm run setup

# 2. Start backend + frontend in parallel
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/doc |
| Health | http://localhost:3000/health |

The backend runs database migrations automatically on startup. The SQLite file is created at `backend/data/app.db`.

### Available scripts (root)

| Script | Description |
|--------|-------------|
| `npm run setup` | Installs dependencies at all levels and creates `frontend/.env` if missing |
| `npm run dev` | Starts backend (port 3000) and frontend (port 5173) in parallel |
| `npm run dev:backend` | API only |
| `npm run dev:frontend` | SPA only |
| `npm run build` | Builds backend and frontend |
| `npm run db:migrate` | Runs migrations manually (optional; startup already applies them) |
| `npm run test` | Backend tests (Jest) |
| `npm run lint` | ESLint on backend and frontend |
| `npm run validate` | Lint + tests + backend build, lint + frontend build |

See `backend/package.json` and `frontend/package.json` for package-specific scripts.

### Environment variables

**Frontend** (`frontend/.env`, generated from `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | API base URL. In development, points to the Vite proxy |
| `VITE_API_PROXY_TARGET` | `http://localhost:3000` | Proxy target for `/api` → backend |

**Backend** (optional; defaults in code):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `DATABASE_PATH` | `./data/app.db` | SQLite file path |
| `NODE_ENV` | `development` | Runtime environment |
| `LOG_LEVEL` | `debug` (dev) | Pino log level |

### Sample data (CSV)

Test files in `backend/fixtures/`:

- `ventas_2026-05.csv` — main May 2026 dataset
- `ventas-with-quotes.csv` — quoted fields
- `ventas-partial-errors.csv` — partial row failures
- `ventas-invalid-header.csv` — invalid header (400 error)

Expected CSV header:

```csv
id_venta,fecha,cliente,producto,cantidad,importe,medio_pago
```

### Tech stack — why?

#### Backend

| Technology | Rationale |
|------------|-----------|
| **TypeScript** | Static typing shared with the frontend; fewer API contract bugs |
| **Express 5** | Mature, minimal HTTP framework kept at the architecture edge (adapter) |
| **SQLite + Drizzle ORM** | Zero-config for the challenge; typed schema, versioned migrations, no Docker |
| **Zod** | Single source of truth for input validation and OpenAPI generation |
| **Light Clean Architecture** | Testable use cases, repository ports, framework decoupled from domain |
| **Jest + Supertest** | Unit tests for use cases and full HTTP contract integration tests |
| **Pino** | Structured logging with low overhead |
| **better-sqlite3** | Efficient synchronous driver for SQLite in Node.js |

#### Frontend

| Technology | Rationale |
|------------|-----------|
| **React 19 + Vite** | Fast DX (HMR), modern build, standard ecosystem |
| **TypeScript** | Aligned with backend and API contract types |
| **Tailwind CSS v4** | Utility-first styling with native Vite integration |
| **Flowbite React** | Accessible components (tables, modals, forms) ready for a dashboard |
| **Custom HTTP layer (`HttpService` + `Api`)** | Portable abstraction over `fetch`; hooks decoupled from transport |
| **React Context** | Global UI state (period, filters) without extra libraries for challenge scope |
| **No router** | Single screen with sections; less complexity for the functional scope |

#### Cross-cutting decisions

| Topic | Decision |
|-------|----------|
| **Money** | Decimal strings (`"18500.00"`) to avoid floating-point drift |
| **Dates** | ISO 8601 (`YYYY-MM-DD`) |
| **Idempotency** | Unique `externalId`; resubmitting identical data does not duplicate |
| **CORS in dev** | Vite proxy (`/api` → `localhost:3000`) instead of backend CORS config |
| **OpenAPI** | Generated on startup; interactive docs at `/doc` |

### Architecture

Detailed documentation lives in `specs/`:

| Document | Contents |
|----------|----------|
| [specs/backend-architecture.md](./specs/backend-architecture.md) | Layers, folders, use cases, testing |
| [specs/frontend-architecture.md](./specs/frontend-architecture.md) | HTTP layer, hooks, context, UI |
| [specs/endpoints.md](./specs/endpoints.md) | REST contract (request/response, HTTP codes) |
| [specs/models.md](./specs/models.md) | `Sale` model, validation, idempotency |

#### Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React SPA)                                       │
│  Dashboard · Flowbite · API hooks · Context                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP (proxy /api in dev)
┌───────────────────────────▼─────────────────────────────────┐
│  Backend (Express)                                          │
│  Routes → Use Cases → Domain ← Drizzle (SQLite)             │
└─────────────────────────────────────────────────────────────┘
```

**Backend:** pure domain → use cases → infrastructure (Drizzle, CSV, Express) → presentation (routes, Zod, OpenAPI).

**Frontend:** single screen → per-endpoint hooks → `Api`/`HttpService` layer → backend.

### Project structure

```
colppy-challenge/
├── backend/          # REST API (Express + Drizzle + SQLite)
├── frontend/         # SPA (React + Vite + Tailwind + Flowbite)
├── specs/            # Architecture and contract specifications
├── scripts/          # Monorepo utilities (env setup)
├── package.json      # Orchestration scripts
└── README.md
```

### Typical development flow

1. `npm run setup` — first time or after cloning
2. `npm run dev` — day-to-day development
3. `npm run validate` — before submitting or opening a PR
4. Import `backend/fixtures/ventas_2026-05.csv` from the UI to seed data

### Out of scope

Features deliberately excluded from the challenge to keep focus on the dashboard core:

| Area | What is not included |
|------|----------------------|
| **Security** | Authentication and authorization |
| **Operations** | Docker, deployment, and production configuration |
| **Sales** | Sale update and delete |
| **Sales** | Text search (customer, product, etc.) |
| **API** | GraphQL or tRPC |
| **Frontend** | Client-side routing (React Router, etc.) |
| **Frontend** | External global state (Redux, Jotai, Zustand, etc.) |
| **Frontend** | Axios implementation (only `FetchHttpService`) |
| **Frontend** | Responsive layout adjustments (mobile/tablet) |
| **Testing** | E2E tests (Playwright, Cypress) |
| **i18n** | Internationalization framework (Spanish copy is hardcoded) |

See also [specs/backend-architecture.md](./specs/backend-architecture.md) and [specs/frontend-architecture.md](./specs/frontend-architecture.md).
