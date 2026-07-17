# Data Models

## Sale (`sales`)

| Field           | Type   | DB column        | Constraints                              |
|-----------------|--------|------------------|------------------------------------------|
| `id`            | number | `id`             | PK, auto-increment (internal)            |
| `externalId`    | string | `external_id`    | UNIQUE, NOT NULL — maps CSV `id_venta`   |
| `date`          | string | `date`           | ISO date `YYYY-MM-DD`, NOT NULL          |
| `customer`      | string | `customer`       | NOT NULL, max 200                        |
| `product`       | string | `product`        | NOT NULL, max 200                        |
| `quantity`      | number | `quantity`       | positive integer                         |
| `amount`        | string | `amount`         | decimal string with up to 2 decimals   |
| `paymentMethod` | enum   | `payment_method` | NOT NULL                                 |
| `createdAt`     | string | `created_at`     | ISO 8601 datetime                        |

### PaymentMethod

| Value           | CSV value     |
|-----------------|---------------|
| `transferencia` | transferencia |
| `tarjeta`       | tarjeta       |
| `efectivo`      | efectivo      |

### Validation rules

| Field        | Rule |
|--------------|------|
| `externalId` | Pattern `^V-\d+$`, unique |
| `date`       | Valid calendar date |
| `quantity`   | Positive integer |
| `amount`     | Positive number, max 2 decimal places |

### Idempotency

- `external_id` is UNIQUE in the database.
- Re-submitting the same sale (same `externalId` with identical data) does not duplicate; response is idempotent.
- Same `externalId` with different data → `409 CONFLICT`.

## Technical decisions

| Topic            | Decision |
|------------------|----------|
| Database engine  | SQLite   |
| Date/time format | ISO 8601 strings (`YYYY-MM-DD` for dates) |
| Money            | `amount` stored and returned as decimal string (avoids float drift) |
| Period           | Inclusive date range `[from, to]` filtered on `date` |
