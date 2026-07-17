import type { HttpRouter } from "../infrastructure/http/http-router";
import { createHealthModule } from "../modules/health/health.module";
import { createSalesModule } from "../modules/sales/sales.module";
import type { AppModule, ModuleContext } from "./module-context";

type LeafModuleFactory = (ctx: ModuleContext) => AppModule;

export interface BootstrapResult {
  routers: HttpRouter[];
}

const leafModuleFactories: LeafModuleFactory[] = [createHealthModule, createSalesModule];

async function runModuleInit(modules: AppModule[], ctx: ModuleContext): Promise<void> {
  await Promise.all(
    modules.map(async (module) => {
      if (module.onInit) {
        await module.onInit(ctx);
      }
    })
  );
}

function collectRouters(...modules: AppModule[]): HttpRouter[] {
  return modules.flatMap((module) => module.routers ?? []);
}

export async function bootstrapModules(ctx: ModuleContext): Promise<BootstrapResult> {
  const allModules = leafModuleFactories.map((factory) => factory(ctx));

  await runModuleInit(allModules, ctx);

  return {
    routers: collectRouters(...allModules),
  };
}
