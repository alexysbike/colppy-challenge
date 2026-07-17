# Backend Architecture

Colppy Sales API. Lightweight Clean Architecture with a class-based HTTP abstraction, Drizzle ORM (SQLite), Zod validation, centralized errors, OpenAPI generation on startup, Jest tests, and ESLint/Prettier.

Related specs: [models.md](./models.md), [endpoints.md](./endpoints.md).

---

## Principles

| Principle | Application |
|-----------|-------------|
| Dependency rule | Inner layers never import from outer layers |
| Light Clean Architecture | Use cases + repository ports; no event bus, no CQRS |
| Single validation source | Zod schemas drive runtime validation and OpenAPI |
| Framework at the edge | Express lives only in `infrastructure/http/express` |
| Fail explicitly | Use cases throw typed errors; HTTP layer maps them to responses |
| Class-based routing | Each endpoint is an `HttpRoute` subclass; routers group routes |

---

## Layer diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation (HTTP)                                        │
│  HttpRoute subclasses · HttpRouter · Zod schemas · OpenAPI  │
└───────────────────────────┬─────────────────────────────────┘
                            │ depends on
┌───────────────────────────▼─────────────────────────────────┐
│  Application (use cases)                                    │
│  CreateSale · ImportSalesCsv · ListSales · GetSalesSummary   │
└───────────────────────────┬─────────────────────────────────┘
                            │ depends on
┌───────────────────────────▼─────────────────────────────────┐
│  Domain                                                     │
│  entities · repository interfaces (ports)                   │
└───────────────────────────▲─────────────────────────────────┘
                            │ implements
┌───────────────────────────┴─────────────────────────────────┐
│  Infrastructure                                             │
│  Drizzle repos · SQLite · Express adapter · CSV parser      │
└─────────────────────────────────────────────────────────────┘

Composition root (`src/composition/`) orchestrates feature modules at startup.
```

---

## Folder structure

```
src/
├── domain/
│   ├── entities/
│   │   └── sale.ts
│   └── repositories/
│       ├── sale.repository.ts
│       └── sale.repository.types.ts
│
├── application/
│   └── sales/
│       ├── create-sale.use-case.ts
│       ├── import-sales-csv.use-case.ts
│       ├── list-sales.use-case.ts
│       ├── get-sales-summary.use-case.ts
│       └── sale-input.ts
│
├── infrastructure/
│   ├── database/
│   │   ├── client.ts
│   │   ├── migrate.ts
│   │   ├── schema/
│   │   │   ├── index.ts
│   │   │   └── sales.ts
│   │   └── migrations/
│   ├── repositories/
│   │   └── drizzle-sale.repository.ts
│   ├── csv/
│   │   └── sales-csv.parser.ts
│   └── http/
│       └── express/ ...
│
├── presentation/
│   ├── routes/
│   │   ├── health/
│   │   └── sales/
│   ├── mappers/
│   │   └── sale.mapper.ts
│   ├── validators/
│   │   ├── sale.schemas.ts
│   │   └── common.schemas.ts
│   └── openapi/
│       └── registry.ts
│
├── modules/
│   ├── health/
│   └── sales/
│
├── composition/
├── shared/
└── index.ts

tests/
├── unit/application/sales/
├── integration/sales/
└── helpers/
```

---

## Domain

- Pure TypeScript: `Sale` entity and `SaleRepository` port.
- No Express, Drizzle, or Zod imports.
- Entity mirrors [models.md](./models.md).

## Application

- One use case per business operation (aligned with [endpoints.md](./endpoints.md)).
- `CreateSaleUseCase`: idempotent on `externalId` — same data returns existing sale; conflicting data throws `ConflictError`.
- `ImportSalesCsvUseCase`: parses CSV, processes rows individually, returns `{ created, skipped, failed, errors }`.
- `GetSalesSummaryUseCase`: aggregates totals and per-payment-method breakdown for a date range.

## Infrastructure

- **Drizzle**: `sales` table with `external_id` UNIQUE.
- **CSV parser**: maps Spanish CSV columns to domain input; no external CSV library.
- **Express adapter**: `multer` only on `POST /sales/import` (Express edge).

## Presentation

- Zod schemas in `presentation/validators/`; reused by routes and OpenAPI.
- Mappers convert domain entities to API response shapes from [endpoints.md](./endpoints.md).

---

## Idempotency

| Operation | Strategy |
|-----------|----------|
| `POST /sales` | `external_id` UNIQUE; compare fields on duplicate |
| `POST /sales/import` | Per-row: skip if identical, fail if conflicting |

---

## Testing

| Layer | What to test |
|-------|--------------|
| Application (unit) | CreateSale idempotency, ImportSalesCsv row outcomes, summary totals |
| Integration | Full HTTP contract via supertest + in-memory SQLite |

---

## Out of scope

- Authentication / authorization
- Docker / deployment
- Sale update / delete
- GraphQL or tRPC
