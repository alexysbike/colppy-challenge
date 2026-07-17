import type { CreateSaleUseCase } from "./create-sale.use-case";
import { parseSalesCsv } from "./sales-csv.parser";

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

    if (parsed.rows.length === 0) {
      return result;
    }

    const batchResults = this.createSale.importBatch(parsed.rows.map((row) => row.input));

    batchResults.forEach((batchResult, index) => {
      const row = parsed.rows[index]!;

      if (batchResult.status === "created") {
        result.created += 1;
        return;
      }

      if (batchResult.status === "skipped") {
        result.skipped += 1;
        return;
      }

      result.failed += 1;
      result.errors.push({
        row: row.rowNumber,
        externalId: row.input.externalId,
        error: batchResult.error,
      });
    });

    return result;
  }
}
