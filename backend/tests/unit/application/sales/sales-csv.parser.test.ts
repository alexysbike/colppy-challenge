import { parseSalesCsv } from "../../../../src/application/sales/sales-csv.parser";
import { ValidationError } from "../../../../src/shared/errors/validation.error";

const VALID_HEADER = "id_venta,fecha,cliente,producto,cantidad,importe,medio_pago";

function csvRow(
  externalId = "V-1001",
  date = "2026-05-02",
  customer = "Cliente",
  product = "Producto",
  quantity = "1",
  amount = "100.00",
  payment = "transferencia"
) {
  return `${externalId},${date},${customer},${product},${quantity},${amount},${payment}`;
}

describe("parseSalesCsv", () => {
  it("parses valid csv with header and rows", () => {
    const content = [VALID_HEADER, csvRow()].join("\n");
    const result = parseSalesCsv(content);

    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      rowNumber: 2,
      input: {
        externalId: "V-1001",
        date: "2026-05-02",
        customer: "Cliente",
        product: "Producto",
        quantity: 1,
        amount: "100.00",
        paymentMethod: "transferencia",
      },
    });
  });

  it("throws when csv is empty", () => {
    expect(() => parseSalesCsv("   ")).toThrow(ValidationError);
    expect(() => parseSalesCsv("   ")).toThrow("CSV file is empty");
  });

  it("throws when csv has only header", () => {
    expect(() => parseSalesCsv(VALID_HEADER)).toThrow(ValidationError);
    expect(() => parseSalesCsv(VALID_HEADER)).toThrow(
      "CSV must include a header row and at least one data row"
    );
  });

  it("throws when header is invalid", () => {
    const content = ["wrong,header", csvRow()].join("\n");
    expect(() => parseSalesCsv(content)).toThrow(ValidationError);
    expect(() => parseSalesCsv(content)).toThrow("Invalid CSV header");
  });

  it("accepts header with different casing", () => {
    const header = "ID_VENTA,Fecha,Cliente,Producto,Cantidad,Importe,Medio_Pago";
    const content = [header, csvRow()].join("\n");
    const result = parseSalesCsv(content);
    expect(result.rows).toHaveLength(1);
  });

  it("skips empty lines", () => {
    const content = [VALID_HEADER, "", csvRow(), "  ", csvRow("V-1002")].join("\n");
    const result = parseSalesCsv(content);
    expect(result.rows).toHaveLength(2);
  });

  it("collects row errors for invalid external id", () => {
    const content = [VALID_HEADER, csvRow("INVALID")].join("\n");
    const result = parseSalesCsv(content);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({
      row: 2,
      externalId: "INVALID",
      error: "id_venta must match pattern V-<number>",
    });
  });

  it("collects row errors for invalid date", () => {
    const content = [VALID_HEADER, csvRow("V-1001", "02-05-2026")].join("\n");
    const result = parseSalesCsv(content);
    expect(result.errors[0]?.error).toBe("fecha must be YYYY-MM-DD");
  });

  it("collects row errors for invalid quantity", () => {
    const content = [VALID_HEADER, csvRow("V-1001", "2026-05-02", "C", "P", "0")].join("\n");
    const result = parseSalesCsv(content);
    expect(result.errors[0]?.error).toBe("quantity must be a positive integer");
  });

  it("collects row errors for non-integer quantity", () => {
    const content = [VALID_HEADER, csvRow("V-1001", "2026-05-02", "C", "P", "1.5")].join("\n");
    const result = parseSalesCsv(content);
    expect(result.errors[0]?.error).toBe("quantity must be a positive integer");
  });

  it("collects row errors for zero amount", () => {
    const content = [VALID_HEADER, csvRow("V-1001", "2026-05-02", "C", "P", "1", "0")].join("\n");
    const result = parseSalesCsv(content);
    expect(result.errors[0]?.error).toBe("importe must be a positive number");
  });

  it("collects row errors for invalid payment method", () => {
    const content = [
      VALID_HEADER,
      csvRow("V-1001", "2026-05-02", "C", "P", "1", "10", "crypto"),
    ].join("\n");
    const result = parseSalesCsv(content);
    expect(result.errors[0]?.error).toBe("medio_pago must be transferencia, tarjeta, or efectivo");
  });

  it("collects row errors for missing customer or product", () => {
    const content = [VALID_HEADER, csvRow("V-1001", "2026-05-02", "  ", "P")].join("\n");
    const result = parseSalesCsv(content);
    expect(result.errors[0]?.error).toBe("cliente and producto are required");
  });

  it("collects row errors for missing columns", () => {
    const content = [VALID_HEADER, "V-1001,2026-05-02,Cliente"].join("\n");
    const result = parseSalesCsv(content);
    expect(result.errors[0]?.error).toBe("Row has missing columns");
  });

  it("parses quoted fields with commas", () => {
    const row = 'V-1001,2026-05-02,"Cliente, SA","Producto, especial",1,100.00,efectivo';
    const content = [VALID_HEADER, row].join("\n");
    const result = parseSalesCsv(content);

    expect(result.errors).toHaveLength(0);
    expect(result.rows[0]?.input.customer).toBe("Cliente, SA");
    expect(result.rows[0]?.input.product).toBe("Producto, especial");
  });

  it("parses quoted fields with escaped double quotes", () => {
    const row = 'V-1001,2026-05-02,"Cliente ""VIP""","Producto",1,100.00,tarjeta';
    const content = [VALID_HEADER, row].join("\n");
    const result = parseSalesCsv(content);

    expect(result.rows[0]?.input.customer).toBe('Cliente "VIP"');
  });

  it("normalizes amount to two decimal places", () => {
    const content = [VALID_HEADER, csvRow("V-1001", "2026-05-02", "C", "P", "1", "100.5")].join(
      "\n"
    );
    const result = parseSalesCsv(content);
    expect(result.rows[0]?.input.amount).toBe("100.50");
  });

  it("parses multiple rows with mixed valid and invalid", () => {
    const content = [VALID_HEADER, csvRow(), csvRow("BAD"), csvRow("V-1002")].join("\n");
    const result = parseSalesCsv(content);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
  });

  it("handles windows line endings", () => {
    const content = `${VALID_HEADER}\r\n${csvRow()}\r\n`;
    const result = parseSalesCsv(content);
    expect(result.rows).toHaveLength(1);
  });
});
