import type { SaleRepository } from "../../domain/repositories/sale.repository";
import type { SalesSummary } from "../../domain/repositories/sale.repository.types";
import { ValidationError } from "../../shared/errors/validation.error";

export interface GetSalesSummaryInput {
  from?: string;
  to?: string;
  month?: string;
}

export class GetSalesSummaryUseCase {
  constructor(private readonly repository: SaleRepository) {}

  async execute(input: GetSalesSummaryInput): Promise<SalesSummary> {
    const range = resolveDateRange(input);
    return this.repository.getSummary(range.from, range.to);
  }
}

function resolveDateRange(input: GetSalesSummaryInput): { from: string; to: string } {
  if (input.month) {
    if (input.from || input.to) {
      throw new ValidationError("Provide either month or from/to, not both");
    }
    const match = /^(\d{4})-(\d{2})$/.exec(input.month);
    if (!match) {
      throw new ValidationError("month must be in YYYY-MM format");
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month < 1 || month > 12) {
      throw new ValidationError("month must be a valid calendar month");
    }
    const lastDay = new Date(year, month, 0).getDate();
    return {
      from: `${match[1]}-${match[2]}-01`,
      to: `${match[1]}-${match[2]}-${String(lastDay).padStart(2, "0")}`,
    };
  }

  if (!input.from || !input.to) {
    throw new ValidationError("from and to are required when month is not provided");
  }

  if (input.from > input.to) {
    throw new ValidationError("from must be on or before to");
  }

  return { from: input.from, to: input.to };
}
