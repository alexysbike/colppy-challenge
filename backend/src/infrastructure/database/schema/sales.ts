import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sales = sqliteTable(
  "sales",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    externalId: text("external_id").notNull().unique(),
    date: text("date").notNull(),
    customer: text("customer").notNull(),
    product: text("product").notNull(),
    quantity: integer("quantity").notNull(),
    amount: text("amount").notNull(),
    paymentMethod: text("payment_method").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("sales_date_idx").on(table.date)]
);
