# Frontend Architecture

Colppy Sales Dashboard. Single-page React app with Vite, Tailwind CSS, Flowbite React, Vitest, ESLint, and a custom HTTP layer (`HttpService` + `Api`) for typed API calls via hooks.

Related specs: [models.md](./models.md), [endpoints.md](./endpoints.md), [backend-architecture.md](./backend-architecture.md).

---

## Principles

| Principle | Application |
|-----------|-------------|
| API contract as source of truth | Types and hooks mirror [endpoints.md](./endpoints.md) |
| Thin UI, fat hooks | The page composes Flowbite components; data fetching lives in `platform/api/endpoints/` |
| Framework at the edge | React/Flowbite only in `screens/` and `components/` |
| Portable HTTP layer | `HttpService` abstracts fetch; swap implementation without touching hooks |
| No auth for this challenge | `Api` session/token APIs exist in the lib but are **not configured** |
| Explicit errors | Surface API `error` + `code` from backend; no silent failures in forms |
| Single page | No client-side router; one screen with sections/tabs for dashboard, list, create, and import |
| Global state via Context | React Context API only — no external state libraries |

---

## Tech stack

| Tool | Role |
|------|------|
| **Vite** | Dev server, build, path aliases (`@/`) |
| **React 19** | UI |
| **TypeScript** | Strict typing |
| **Tailwind CSS v4** | Utility-first styling (`@tailwindcss/vite`) |
| **Flowbite React** | Accessible UI components (tables, modals, forms, alerts, tabs) |
| **Vitest** | Unit/component tests |
| **@testing-library/react** | Component testing |
| **ESLint 9 (flat config)** | Linting (TS + React Hooks + React Refresh) |
| **Prettier** | Formatting (optional; align with backend if added) |

---

## Layer diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Single page (DashboardScreen)                              │
│  Flowbite · Tailwind · tabs/sections · local form state   │
└───────────────────────────┬─────────────────────────────────┘
                            │ uses hooks + context
┌───────────────────────────▼─────────────────────────────────┐
│  Context (`context/`)                                       │
│  AppContext — period filters, active tab, shared UI state   │
└───────────────────────────┬─────────────────────────────────┘
                            │ uses hooks
┌───────────────────────────▼─────────────────────────────────┐
│  Platform API (`platform/api/`)                             │
│  ColppyApi · endpoint hooks (useListSales, useSalesSummary…)  │
└───────────────────────────┬─────────────────────────────────┘
                            │ uses
┌───────────────────────────▼─────────────────────────────────┐
│  Api + HttpService (`src/lib/`)                             │
│  RESTEndpoint · useApiCall · ApiContextProvider             │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP
┌───────────────────────────▼─────────────────────────────────┐
│  Backend API (`http://localhost:3000`)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder structure

```
frontend/
├── public/
├── src/
│   ├── lib/
│   │   ├── HttpService/
│   │   │   ├── HttpService.ts
│   │   │   ├── FetchHttpService.ts
│   │   │   └── index.ts
│   │   └── Api/
│   │       ├── Api.ts
│   │       ├── RESTEndpoint.ts
│   │       ├── EndpointManager.ts
│   │       ├── MockEndpoint.ts
│   │       ├── TokenManager.ts      # required by Api; unused in this challenge
│   │       ├── index.ts
│   │       └── react/
│   │           ├── context/
│   │           │   └── ApiReactContext.tsx
│   │           └── hooks/
│   │               ├── useApi.ts
│   │               ├── useApiCall.ts
│   │               ├── useApiEndpoint.ts
│   │               └── index.ts
│   │
│   ├── platform/
│   │   └── api/
│   │       ├── ColppyApi.ts
│   │       ├── types/
│   │       │   ├── sale.ts
│   │       │   ├── pagination.ts
│   │       │   └── api-error.ts
│   │       ├── endpoints/
│   │       │   ├── useListSales.ts
│   │       │   ├── useSalesSummary.ts
│   │       │   ├── useCreateSale.ts
│   │       │   ├── useImportSales.ts
│   │       │   └── useHealth.ts
│   │       └── index.ts
│   │
│   ├── context/
│   │   ├── AppContext.tsx          # global UI state (period, tab, pagination)
│   │   ├── AppProvider.tsx
│   │   └── index.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── sales/
│   │   └── feedback/
│   │
│   ├── screens/
│   │   └── DashboardScreen/
│   │       ├── DashboardScreen.tsx
│   │       ├── SummarySection.tsx
│   │       ├── SalesListSection.tsx
│   │       ├── CreateSaleSection.tsx
│   │       └── ImportSalesSection.tsx
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── theme/
│   │   └── theme.ts                # Flowbite theme overrides
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .flowbite-react/
│   ├── config.json
│   └── init.tsx                    # generated by flowbite CLI
├── eslint.config.js
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── package.json
```

---

## HTTP layer (`HttpService`)

Custom abstraction that encapsulates HTTP transport.

### Responsibilities

- `execute(method, url, options)` with lifecycle hooks: `preExecute`, `onSuccess`, `onError`
- Convenience methods: `get`, `post`, `put`, `patch`, `delete`
- Config: `baseUrl`, default `headers`, optional `credentials`

### Implementation

- **`FetchHttpService`**: default implementation using native `fetch`
- Parses JSON on success; on error throws `{ error, statusCode, headers }`
- **`FormData`**: when `body` is `FormData`, do not `JSON.stringify`; for `POST /sales/import` pass headers **without** `Content-Type` so the browser sets the multipart boundary

```ts
// Import example — override default JSON header
const formData = new FormData()
formData.append('file', file)
await endpoint.execute({
  method: METHOD.POST,
  body: formData,
  headers: {}, // or omit Content-Type explicitly
})
```

Future: add `AxiosHttpService` implementing the same `doCall` contract.

---

## API layer (`Api`)

Orchestrates endpoints on top of `HttpService`.

### Core types

| Type | Role |
|------|------|
| `Api` | Abstract base: wires `HttpService`, registers endpoints |
| `RESTEndpoint` | Path + query/params builder + `execute()` |
| `EndpointManager` | Registry of path → endpoint class |
| `MockEndpoint` | Test double returning static data without network |

### React integration

| Hook | Role |
|------|------|
| `ApiContextProvider` | Provides singleton `ColppyApi` to the tree |
| `useApi()` | Access `api` instance |
| `useApiEndpoint(path)` | Resolves `RESTEndpoint` for a path |
| `useApiCall(method, path, options)` | Stateful hook: `{ data, loading, error, call, reset, statusCode }` |

### `useApiCall` behaviour

- `autoCall: true` (default): fetches on mount
- `autoCall: false`: manual `call()` (mutations, import)
- `throwError: true` (default): rethrows after setting state
- Updates `loading`, `data`, `error`, `statusCode`, `headers` on each call

### Auth (out of scope for challenge)

`Api` supports `SessionConfiguration`, `TokenManager`, header injection, and 403 cleanup. **Do not configure** in `ColppyApi.config()` for this project. Keep `TokenManager.ts` in the lib for portability.

---

## `ColppyApi` setup

```ts
// src/platform/api/ColppyApi.ts
import { Api } from '@/lib/Api'
import { FetchHttpService } from '@/lib/HttpService'
import { config } from '@/config/env'

class ColppyApiImpl extends Api {
  constructor() {
    super(config.apiBaseUrl, {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  protected getHttpService() {
    return FetchHttpService
  }

  protected config(): void {
    // No session configuration for this challenge
    this.registerEndpoint('/health')
    this.registerEndpoint('/sales')
    this.registerEndpoint('/sales/summary')
    this.registerEndpoint('/sales/import')
  }
}

export const ColppyApi = new ColppyApiImpl()
```

### App bootstrap

```tsx
// main.tsx
<StrictMode>
  <ThemeInit />
  <ThemeProvider theme={colppyTheme}>
    <ApiContextProvider api={ColppyApi}>
      <AppProvider>
        <App />
      </AppProvider>
    </ApiContextProvider>
  </ThemeProvider>
</StrictMode>
```

---

## Endpoint hooks

One hook per backend operation. Types live next to the hook; re-export from `platform/api/index.ts`.

| Hook | Method | Path | `autoCall` | Notes |
|------|--------|------|------------|-------|
| `useHealth` | GET | `/health` | `true` | Optional connectivity check |
| `useListSales` | GET | `/sales` | `true` | Query: `from`, `to`, `page`, `limit` |
| `useSalesSummary` | GET | `/sales/summary` | `true` | Query: `month` **or** `from`+`to` |
| `useCreateSale` | POST | `/sales` | `false` | Manual `call(body)` |
| `useImportSales` | POST | `/sales/import` | `false` | `call(formData)` with `asBlob` false |

### Example: list sales

```ts
import { METHOD } from '@/lib/HttpService'
import { useApiCall } from '@/lib/Api'
import type { Sale } from '../types/sale'
import type { PaginatedResponse } from '../types/pagination'

export interface ListSalesQuery {
  from?: string
  to?: string
  page?: number
  limit?: number
}

export const useListSales = (
  query: ListSalesQuery,
  options?: { autoCall?: boolean },
) =>
  useApiCall<PaginatedResponse<Sale>, never, never, ListSalesQuery>(
    METHOD.GET,
    '/sales',
    { query, autoCall: options?.autoCall ?? true },
  )
```

### Example: create sale

```ts
export const useCreateSale = () =>
  useApiCall<Sale, never, CreateSaleInput, never>(
    METHOD.POST,
    '/sales',
    { autoCall: false, throwError: false },
  )
```

Handle `201` vs `200` (idempotent duplicate) via `statusCode`.

### Types (mirror [models.md](./models.md))

```ts
export type PaymentMethod = 'transferencia' | 'tarjeta' | 'efectivo'

export interface Sale {
  id: number
  externalId: string
  date: string
  customer: string
  product: string
  quantity: number
  amount: string
  paymentMethod: PaymentMethod
}

export interface ApiErrorBody {
  error: string
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL_ERROR' | string
}
```

---

## Single page layout

No client-side router. `App` renders `DashboardScreen` as the only screen. Navigation between views uses **Flowbite Tabs** (or equivalent section toggles) inside the page.

| Section | Hook(s) | UI |
|---------|---------|-----|
| Summary | `useSalesSummary` | Period selector (`month` or range), KPI cards, breakdown by `paymentMethod` |
| Sales list | `useListSales` | Flowbite `Table`, pagination, date filters |
| Create sale | `useCreateSale` | Form fields per [endpoints.md](./endpoints.md); inline panel or modal |
| Import CSV | `useImportSales` | File input, upload button, results (`created`, `skipped`, `failed`, `errors`) |

---

## Global state (`AppContext`)

React Context API for shared UI state across sections. Server data stays in `useApiCall` hooks — context holds only client-side coordination state.

### State shape

```ts
interface AppState {
  period: {
    mode: 'month' | 'range'
    month?: string          // YYYY-MM
    from?: string           // YYYY-MM-DD
    to?: string             // YYYY-MM-DD
  }
}
```

### Actions

| Action | Description |
|--------|-------------|
| `setPeriod` | Update filter shared by summary and list |

### Usage

- `AppProvider` wraps the app tree (inside `ApiContextProvider`)
- Sections read period from `useAppContext()` and pass as query params to hooks
- When period changes, dependent hooks re-fetch via updated `query` props

### Local state (component-level only)

- Form field values and client-side validation (create sale)
- Import file selection and result panel
- Modal open/close (if create sale uses a modal)
- Paginations

---

## Styling (Tailwind + Flowbite)

### `vite.config.ts`

```ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from 'flowbite-react/plugin/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})
```

Use `VITE_API_BASE_URL=/api` in dev to avoid CORS; production uses full backend URL via env.

### `index.css`

```css
@import "tailwindcss";
@import "flowbite-react/plugin/tailwindcss";
@source "../.flowbite-react/class-list.json";
```

### Flowbite init

```bash
npx flowbite-react@latest init
```

Generates `.flowbite-react/config.json` and `init.tsx`.

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` (dev) | API base URL for `ColppyApi` |

```ts
// src/config/env.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
}
```

---

## ESLint

Flat config aligned with backend strictness + React rules.

### `eslint.config.js`

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', '.flowbite-react']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      'no-console': 'error',
    },
  },
])
```

### Scripts

```json
{
  "lint": "eslint src",
  "lint:fix": "eslint src --fix"
}
```

### Dev dependencies

`eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`, `globals`

---

## Testing (Vitest)

| Layer | What to test |
|-------|--------------|
| `lib/HttpService` | `FetchHttpService` success/error parsing, `FormData` body |
| `lib/Api` | `RESTEndpoint` path/query building |
| Endpoint hooks | Render with `ApiContextProvider` + `MockEndpoint` or MSW |
| `AppContext` | Period/pagination updates propagate to consumers |
| Components | Loading/error/empty states, form submit, import results display |
| `DashboardScreen` | Tab switching, section visibility |

### `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

### Test utilities

- `renderWithProviders(ui)` — wraps `ApiContextProvider` + `AppProvider`
- `createMockColppyApi()` — overrides `getEndpoint` with `MockEndpoint` subclasses
- Prefer testing behaviour over implementation details

### Scripts

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

---

## `package.json` scripts (summary)

| Script | Command |
|--------|---------|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `preview` | `vite preview` |
| `test` | `vitest run` |
| `lint` | `eslint src` |
| `validate` | `npm run lint && npm run test && npm run build` |

---

## Backend integration notes

- Backend runs on **port 3000** (see backend `env.ts`)
- **CORS** is not configured on the backend yet; use **Vite proxy** (`/api` → `localhost:3000`) in development
- For production builds, either add CORS to the backend or serve frontend behind the same origin
- Money fields are **strings** (`"18500.00"`); format in UI with `Intl.NumberFormat('es-AR', …)` without parsing to float for display logic
- `paymentMethod` labels: map enum values to Spanish labels in the UI layer only

---

## Out of scope

- Authentication / authorization (lib support exists, not wired)
- Client-side routing (React Router, etc.)
- External state management (Redux, Jotai, Zustand, etc.)
- Axios implementation (only `FetchHttpService` for now)
- Sale update / delete UI
- E2E tests (Playwright/Cypress)
- i18n framework (Spanish copy hardcoded is fine)
