import type { CreateSaleUseCase } from "./create-sale.use-case";
import { parseSalesCsv } from "./sales-csv.parser";
import { ConflictError } from "../../shared/errors/conflict.error";

export interface ImportRowError {
  row: number;
  externalId?: string;
  error: string;
}

export interface ImportSalesCsvResult {
  created: number;
  skipped: number;
  failed: number;
  errors: ImportRowError[];
}

export class ImportSalesCsvUseCase {
  constructor(private readonly createSale: CreateSaleUseCase) {}

  async execute(csvContent: string): Promise<ImportSalesCsvResult> {
    const parsed = parseSalesCsv(csvContent);
    const result: ImportSalesCsvResult = {
      created: 0,
      skipped: 0,
      failed: parsed.errors.length,
      errors: [...parsed.errors],
    };

    for (const row of parsed.rows) {
      try {
        const outcome = await this.createSale.execute(row.input);
        if (outcome.created) {
          result.created += 1;
        } else {
          result.skipped += 1;
        }
      } catch (error) {
        result.failed += 1;
        result.errors.push({
          row: row.rowNumber,
          externalId: row.input.externalId,
          error: error instanceof ConflictError ? error.message : "Failed to import row",
        });
      }
    }

    return result;
  }
}
