# API Endpoints

Base URL: `/`

Format: JSON request and response bodies (except CSV import: `multipart/form-data`).
Charset: UTF-8.

## Conventions

| Situation                         | Status code |
|-----------------------------------|-------------|
| Resource created                  | `201`       |
| Successful operation with body    | `200`       |
| Successful deletion               | `204`       |
| Invalid body or query params      | `400`       |
| Resource not found                | `404`       |
| Conflict (e.g. duplicate sale)    | `409`       |
| Internal error                    | `500`       |

### Error format

```json
{
  "error": "Human-readable error description",
  "code": "VALIDATION_ERROR"
}
```

Suggested codes: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`, `METHOD_NOT_ALLOWED`.

### Empty results

List endpoints return **`200`** with an empty `data` array when no matches are found. Do not use `404` for empty results.

---

## Health check

### `GET /health`

Verifies the service is running.

**Response `200`**

```json
{ "status": "ok" }
```

---

## Sales — detail

### `GET /sales`

Lists sales with filters and pagination.

**Query params**

| Param   | Type   | Required | Description |
|---------|--------|----------|-------------|
| `from`  | date   | no       | Period start (`YYYY-MM-DD`) |
| `to`    | date   | no       | Period end (inclusive) |
| `page`  | number | no       | default `1` |
| `limit` | number | no       | default `20`, max `100` |

**Response `200`**

```json
{
  "data": [
    {
      "id": 1,
      "externalId": "V-1001",
      "date": "2026-05-02",
      "customer": "Comercial Andrade",
      "product": "Servicio de consultoria",
      "quantity": 1,
      "amount": "18500.00",
      "paymentMethod": "transferencia"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 14 }
}
```

---

## Sales — summary

### `GET /sales/summary`

Period totals for the dashboard.

**Query params**

| Param   | Type   | Required | Description |
|---------|--------|----------|-------------|
| `from`  | date   | yes*     | Period start |
| `to`    | date   | yes*     | Period end (inclusive) |
| `month` | string | yes*     | Shorthand `YYYY-MM` → first/last day of month |

\* Provide either `month` or both `from` and `to`.

**Response `200`**

```json
{
  "from": "2026-05-01",
  "to": "2026-05-31",
  "totalAmount": "228234.56",
  "count": 14,
  "byPaymentMethod": {
    "transferencia": { "count": 5, "totalAmount": "89100.00" },
    "tarjeta": { "count": 4, "totalAmount": "52534.56" },
    "efectivo": { "count": 5, "totalAmount": "86600.00" }
  }
}
```

---

## Sales — single create

### `POST /sales`

**Body**

```json
{
  "externalId": "V-1042",
  "date": "2026-07-30",
  "customer": "Nuevo Cliente",
  "product": "Producto X",
  "quantity": 2,
  "amount": "1500.00",
  "paymentMethod": "efectivo"
}
```

**Responses**

| Case | Status | Body |
|------|--------|------|
| Created | `201` | Sale object |
| Already exists (same data) | `200` | Existing sale object |
| Already exists (different data) | `409` | Error object |

---

## Sales — bulk CSV import

### `POST /sales/import`

`Content-Type: multipart/form-data`, field name `file` (`.csv`).

**Expected CSV header** (matches provided fixtures):

```
id_venta,fecha,cliente,producto,cantidad,importe,medio_pago
```

**Response `200`** (file processed; individual row failures reported):

```json
{
  "created": 10,
  "skipped": 3,
  "failed": 1,
  "errors": [
    { "row": 5, "externalId": "V-9999", "error": "quantity must be a positive integer" }
  ]
}
```

| Per-row outcome | Behaviour |
|-----------------|-----------|
| Valid new sale | `created++` |
| `id_venta` exists, same data | `skipped++` |
| `id_venta` exists, different data | `failed++` + error |
| Invalid row | `failed++` + error |

**File-level errors** (empty file, missing header, not CSV) → `400`.
