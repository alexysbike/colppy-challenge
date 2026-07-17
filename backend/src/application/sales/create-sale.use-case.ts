import type { Sale } from "../../domain/entities/sale";
import type { SaleRepository } from "../../domain/repositories/sale.repository";
import type { CreateSaleInput } from "../../domain/repositories/sale.repository.types";
import { ConflictError } from "../../shared/errors/conflict.error";
import { normalizeSaleInput, saleMatchesInput } from "./sale-input";

export interface CreateSaleResult {
  sale: Sale;
  created: boolean;
}

export type ImportBatchItemResult =
  { status: "created" } | { status: "skipped" } | { status: "failed"; error: string };

function toPendingSale(input: CreateSaleInput): Sale {
  return {
    id: 0,
    externalId: input.externalId,
    date: input.date,
    customer: input.customer,
    product: input.product,
    quantity: input.quantity,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    createdAt: "",
  };
}

export class CreateSaleUseCase {
  constructor(private readonly repository: SaleRepository) {}

  async execute(input: CreateSaleInput): Promise<CreateSaleResult> {
    const normalized = normalizeSaleInput(input);
    const existing = await this.repository.findByExternalId(normalized.externalId);

    if (existing) {
      if (saleMatchesInput(existing, normalized)) {
        return { sale: existing, created: false };
      }
      throw new ConflictError(`Sale ${normalized.externalId} already exists with different data`);
    }

    const sale = await this.repository.create(normalized);
    return { sale, created: true };
  }

  importBatch(inputs: CreateSaleInput[]): ImportBatchItemResult[] {
    if (inputs.length === 0) {
      return [];
    }

    return this.repository.runInTransaction((repo) => {
      const normalizedInputs = inputs.map(normalizeSaleInput);
      const existingFromDb = repo.findByExternalIds(
        normalizedInputs.map((input) => input.externalId)
      );
      const pending = new Map<string, Sale>();
      const results: ImportBatchItemResult[] = new Array(inputs.length);
      const toInsert: CreateSaleInput[] = [];
      const toInsertIndices: number[] = [];

      for (let index = 0; index < normalizedInputs.length; index += 1) {
        const normalized = normalizedInputs[index]!;
        const existing =
          pending.get(normalized.externalId) ?? existingFromDb.get(normalized.externalId) ?? null;

        if (existing) {
          if (saleMatchesInput(existing, normalized)) {
            results[index] = { status: "skipped" };
          } else {
            results[index] = {
              status: "failed",
              error: `Sale ${normalized.externalId} already exists with different data`,
            };
          }
          continue;
        }

        pending.set(normalized.externalId, toPendingSale(normalized));
        toInsert.push(normalized);
        toInsertIndices.push(index);
      }

      if (toInsert.length > 0) {
        repo.insertMany(toInsert);
      }

      for (const index of toInsertIndices) {
        results[index] = { status: "created" };
      }

      return results;
    });
  }
}
