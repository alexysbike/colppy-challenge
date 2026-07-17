import type { Sale } from "../../domain/entities/sale";
import type { SaleRepository } from "../../domain/repositories/sale.repository";
import type { CreateSaleInput } from "../../domain/repositories/sale.repository.types";
import { ConflictError } from "../../shared/errors/conflict.error";
import { normalizeSaleInput, saleMatchesInput } from "./sale-input";

export interface CreateSaleResult {
  sale: Sale;
  created: boolean;
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
}
