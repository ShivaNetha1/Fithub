export const AUTH_ROUTES = ["/auth/login", "/auth/signup"];
export const PUBLIC_ROUTES = ["/", "/api/health", "/auth/callback", "/auth/forgot-password"];
export const APP_HOME = "/dashboard";
export const LOGIN_PATH = "/auth/login";
export const ONBOARDING_PATH = "/onboarding";

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
