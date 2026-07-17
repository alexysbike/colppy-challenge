import { PAYMENT_METHODS, type PaymentMethod } from "../../domain/entities/sale";
import type { CreateSaleInput } from "../../domain/repositories/sale.repository.types";
import { ValidationError } from "../../shared/errors/validation.error";
import { normalizeAmount } from "../../shared/money";
import { normalizeSaleInput } from "./sale-input";

const EXPECTED_HEADER = [
  "id_venta",
  "fecha",
  "cliente",
  "producto",
  "cantidad",
  "importe",
  "medio_pago",
];

export interface ParsedCsvRow {
  rowNumber: number;
  input: CreateSaleInput;
}

export interface CsvParseError {
  row: number;
  externalId?: string;
  error: string;
}

export interface CsvParseResult {
  rows: ParsedCsvRow[];
  errors: CsvParseError[];
}

export function parseSalesCsv(content: string): CsvParseResult {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new ValidationError("CSV file is empty");
  }

  const lines = splitCsvLines(trimmed);
  if (lines.length < 2) {
    throw new ValidationError("CSV must include a header row and at least one data row");
  }

  const header = parseCsvLine(lines[0]).map((value) => value.trim().toLowerCase());
  if (!headersMatch(header)) {
    throw new ValidationError(`Invalid CSV header. Expected: ${EXPECTED_HEADER.join(",")}`);
  }

  const rows: ParsedCsvRow[] = [];
  const errors: CsvParseError[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      continue;
    }

    const rowNumber = index + 1;
    const values = parseCsvLine(line);

    try {
      const input = mapCsvRow(values);
      rows.push({ rowNumber, input: normalizeSaleInput(input) });
    } catch (error) {
      errors.push({
        row: rowNumber,
        externalId: values[0]?.trim() || undefined,
        error: error instanceof Error ? error.message : "Invalid row",
      });
    }
  }

  return { rows, errors };
}

function headersMatch(header: string[]): boolean {
  if (header.length !== EXPECTED_HEADER.length) {
    return false;
  }
  return EXPECTED_HEADER.every((column, index) => header[index] === column);
}

function mapCsvRow(values: string[]): CreateSaleInput {
  if (values.length < EXPECTED_HEADER.length) {
    throw new Error("Row has missing columns");
  }

  const [externalId, date, customer, product, quantityRaw, amountRaw, paymentMethodRaw] = values;
  const externalIdValue = externalId.trim();
  if (!/^V-\d+$/.test(externalIdValue)) {
    throw new Error("id_venta must match pattern V-<number>");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    throw new Error("fecha must be YYYY-MM-DD");
  }

  const quantity = Number(quantityRaw);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("quantity must be a positive integer");
  }

  const amount = normalizeAmount(amountRaw.trim());
  if (Number(amount) <= 0) {
    throw new Error("importe must be a positive number");
  }

  const paymentMethod = paymentMethodRaw.trim().toLowerCase() as PaymentMethod;
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error("medio_pago must be transferencia, tarjeta, or efectivo");
  }

  if (!customer.trim() || !product.trim()) {
    throw new Error("cliente and producto are required");
  }

  return {
    externalId: externalIdValue,
    date: date.trim(),
    customer: customer.trim(),
    product: product.trim(),
    quantity,
    amount,
    paymentMethod,
  };
}

function splitCsvLines(content: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];

    if (char === '"') {
      if (inQuotes && content[index + 1] === '"') {
        current += '""';
        index += 1;
      } else {
        inQuotes = !inQuotes;
        current += '"';
      }
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && content[index + 1] === "\n") {
        index += 1;
      }
      lines.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || lines.length > 0) {
    lines.push(current);
  }

  return lines;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}
