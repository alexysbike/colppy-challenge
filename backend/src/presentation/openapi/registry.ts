import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  createSaleSchema,
  listSalesQuerySchema,
  salesSummaryQuerySchema,
} from "../validators/sale.schemas";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const saleResponseSchema = z
  .object({
    id: z.number().int(),
    externalId: z.string(),
    date: z.string(),
    customer: z.string(),
    product: z.string(),
    quantity: z.number().int(),
    amount: z.string(),
    paymentMethod: z.string(),
  })
  .openapi("Sale");

const errorResponseSchema = z
  .object({
    error: z.string(),
    code: z.string(),
  })
  .openapi("Error");

registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health"],
  responses: {
    200: {
      description: "Service health",
      content: {
        "application/json": {
          schema: z.object({ status: z.string() }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/sales",
  tags: ["Sales"],
  request: { query: listSalesQuerySchema },
  responses: {
    200: {
      description: "Sales list",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(saleResponseSchema),
            meta: z.object({
              page: z.number().int(),
              limit: z.number().int(),
              total: z.number().int(),
            }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/sales",
  tags: ["Sales"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createSaleSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Existing sale",
      content: { "application/json": { schema: saleResponseSchema } },
    },
    201: {
      description: "Created sale",
      content: { "application/json": { schema: saleResponseSchema } },
    },
    409: {
      description: "Conflict",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/sales/summary",
  tags: ["Sales"],
  request: { query: salesSummaryQuerySchema },
  responses: {
    200: {
      description: "Sales summary",
      content: {
        "application/json": {
          schema: z.object({
            from: z.string(),
            to: z.string(),
            totalAmount: z.string(),
            count: z.number().int(),
            byPaymentMethod: z.record(
              z.string(),
              z.object({
                count: z.number().int(),
                totalAmount: z.string(),
              })
            ),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/sales/import",
  tags: ["Sales"],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.string().openapi({ type: "string", format: "binary" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Import result",
      content: {
        "application/json": {
          schema: z.object({
            created: z.number().int(),
            skipped: z.number().int(),
            failed: z.number().int(),
            errors: z.array(
              z.object({
                row: z.number().int(),
                externalId: z.string().optional(),
                error: z.string(),
              })
            ),
          }),
        },
      },
    },
  },
});

export function generateOpenApiDocument(port: number) {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Colppy Sales API",
      version: "1.0.0",
    },
    servers: [{ url: `http://localhost:${port}` }],
  });
}
