import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const schemaSource = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("métricas de operación", () => {
  it("almacena sólo datos técnicos agregables y registra la generación de CV", () => {
    expect(schemaSource).toContain('mysqlTable("operationMetrics"');
    expect(schemaSource).not.toContain('operationMetrics", {\n  id: int("id").autoincrement().primaryKey(),\n  userId');
    expect(routerSource).toContain('recordOperationMetric({ operation: "cv_generated"');
    expect(routerSource).toContain("estimatedCostMicros: 0");
  });
});
