import type { AppModule, ModuleContext } from "../../composition/module-context";
import { HealthRouter } from "../../presentation/routes/health/health.router";

export function createHealthModule(_ctx: ModuleContext): AppModule {
  return {
    name: "health",
    routers: [HealthRouter.create()],
  };
}
