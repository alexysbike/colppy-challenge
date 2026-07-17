import type { HttpRoute } from "./http-route";
import type { HttpRouter } from "./http-router";

export interface MountedRoute {
  path: string;
  route: HttpRoute;
}

export function joinPaths(prefix: string, routePath: string): string {
  const normalizedPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;

  if (routePath === "" || routePath === "/") {
    if (normalizedPrefix === "" || normalizedPrefix === "/") {
      return "/";
    }
    return normalizedPrefix;
  }

  const normalizedRoute = routePath.startsWith("/") ? routePath : `/${routePath}`;

  if (normalizedPrefix === "" || normalizedPrefix === "/") {
    return normalizedRoute;
  }

  return `${normalizedPrefix}${normalizedRoute}`;
}

export function toExpressMethod(method: string): "get" | "post" | "put" | "patch" | "delete" {
  return method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete";
}

export function flattenRouters(routers: readonly HttpRouter[], basePath = ""): MountedRoute[] {
  const result: MountedRoute[] = [];

  for (const router of routers) {
    const routerPath = joinPaths(basePath, router.path);

    for (const route of router.getRoutes()) {
      result.push({
        path: joinPaths(routerPath, route.path),
        route,
      });
    }

    result.push(...flattenRouters(router.getRouters(), routerPath));
  }

  return result;
}
