import { and, count, desc, eq, gte, inArray, lte } from "drizzle-orm";
import type { Sale, PaymentMethod } from "../../domain/entities/sale";
import { PAYMENT_METHODS } from "../../domain/entities/sale";
import type { SaleRepository } from "../../domain/repositories/sale.repository";
import type {
  CreateSaleInput,
  Paginated,
  SaleListFilters,
  SalesSummary,
} from "../../domain/repositories/sale.repository.types";
import { ConflictError } from "../../shared/errors/conflict.error";
import { amountToCents, centsToAmount } from "../../shared/money";
import type { DbClient } from "../database/client";
import { sales } from "../database/schema";

function isUniqueConstraintError(error: unknown): boolean {
  if (error === null || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String((error as { code: unknown }).code) : "";
  if (code === "SQLITE_CONSTRAINT_UNIQUE") {
    return true;
  }

  const message = "message" in error ? String((error as { message: unknown }).message) : "";
  return message.includes("UNIQUE constraint failed");
}

const SQLITE_VARIABLE_LIMIT = 500;

function toEntity(row: typeof sales.$inferSelect): Sale {
  return {
    id: row.id,
    externalId: row.externalId,
    date: row.date,
    customer: row.customer,
    product: row.product,
    quantity: row.quantity,
    amount: row.amount,
    paymentMethod: row.paymentMethod as PaymentMethod,
    createdAt: row.createdAt,
  };
}

export class DrizzleSaleRepository implements SaleRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreateSaleInput): Promise<Sale> {
    try {
      const row = this.db
        .insert(sales)
        .values({
          externalId: input.externalId,
          date: input.date,
          customer: input.customer,
          product: input.product,
          quantity: input.quantity,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          createdAt: new Date().toISOString(),
        })
        .returning()
        .get();

      return toEntity(row);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError(`Sale ${input.externalId} already exists`);
      }
      throw error;
    }
  }

  async findByExternalId(externalId: string): Promise<Sale | null> {
    const rows = await this.db
      .select()
      .from(sales)
      .where(eq(sales.externalId, externalId))
      .limit(1);

    return rows[0] ? toEntity(rows[0]) : null;
  }

  findByExternalIds(externalIds: string[]): Map<string, Sale> {
    const existing = new Map<string, Sale>();
    if (externalIds.length === 0) {
      return existing;
    }

    const uniqueIds = [...new Set(externalIds)];
    for (let index = 0; index < uniqueIds.length; index += SQLITE_VARIABLE_LIMIT) {
      const chunk = uniqueIds.slice(index, index + SQLITE_VARIABLE_LIMIT);
      const rows = this.db.select().from(sales).where(inArray(sales.externalId, chunk)).all();

      for (const row of rows) {
        existing.set(row.externalId, toEntity(row));
      }
    }

    return existing;
  }

  insertMany(inputs: CreateSaleInput[]): void {
    if (inputs.length === 0) {
      return;
    }

    const createdAt = new Date().toISOString();
    for (let index = 0; index < inputs.length; index += SQLITE_VARIABLE_LIMIT) {
      const chunk = inputs.slice(index, index + SQLITE_VARIABLE_LIMIT);

      try {
        this.db
          .insert(sales)
          .values(
            chunk.map((input) => ({
              externalId: input.externalId,
              date: input.date,
              customer: input.customer,
              product: input.product,
              quantity: input.quantity,
              amount: input.amount,
              paymentMethod: input.paymentMethod,
              createdAt,
            }))
          )
          .run();
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new ConflictError("Duplicate sale during batch insert");
        }
        throw error;
      }
    }
  }

  runInTransaction<T>(fn: (repository: SaleRepository) => T): T {
    return this.db.transaction((tx) => fn(new DrizzleSaleRepository(tx as unknown as DbClient)));
  }

  async list(filters: SaleListFilters): Promise<Paginated<Sale>> {
    const conditions = [];
    if (filters.from) {
      conditions.push(gte(sales.date, filters.from));
    }
    if (filters.to) {
      conditions.push(lte(sales.date, filters.to));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (filters.page - 1) * filters.limit;

    const [rows, totalRow] = await Promise.all([
      this.db
        .select()
        .from(sales)
        .where(whereClause)
        .orderBy(desc(sales.date), desc(sales.id))
        .limit(filters.limit)
        .offset(offset),
      this.db.select({ total: count() }).from(sales).where(whereClause),
    ]);

    return {
      data: rows.map(toEntity),
      meta: {
        page: filters.page,
        limit: filters.limit,
        total: totalRow[0]?.total ?? 0,
      },
    };
  }

  async getSummary(from: string, to: string): Promise<SalesSummary> {
    const rows = await this.db
      .select()
      .from(sales)
      .where(and(gte(sales.date, from), lte(sales.date, to)));

    const byPaymentMethod = Object.fromEntries(
      PAYMENT_METHODS.map((method) => [method, { count: 0, totalAmount: "0.00" }])
    ) as SalesSummary["byPaymentMethod"];

    let totalCents = 0;

    for (const row of rows) {
      const cents = amountToCents(row.amount);
      totalCents += cents;
      const method = row.paymentMethod as PaymentMethod;
      const current = byPaymentMethod[method];
      current.count += 1;
      current.totalAmount = centsToAmount(amountToCents(current.totalAmount) + cents);
    }

    return {
      from,
      to,
      count: rows.length,
      totalAmount: centsToAmount(totalCents),
      byPaymentMethod,
    };
  }
}
