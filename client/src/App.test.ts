import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

describe("carga de rutas", () => {
  it("mantiene la landing inicial y carga bajo demanda pantallas secundarias", () => {
    expect(source).toContain('import Home from "./pages/Home"');
    expect(source).toContain('const Dashboard = lazy(() => import("./pages/Dashboard"))');
    expect(source).toContain("<Suspense fallback={<RouteLoading />}>");
  });
});
