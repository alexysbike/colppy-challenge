import type { SaleRepository } from "../../domain/repositories/sale.repository";
import type { SaleListFilters, Paginated } from "../../domain/repositories/sale.repository.types";
import type { Sale } from "../../domain/entities/sale";

export class ListSalesUseCase {
  constructor(private readonly repository: SaleRepository) {}

  async execute(filters: SaleListFilters): Promise<Paginated<Sale>> {
    return this.repository.list(filters);
  }
}
