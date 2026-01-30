import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isProjectsRoute = nextUrl.pathname.startsWith("/projects");

  if (isDashboardRoute || isProjectsRoute) {
    if (!isAuthenticated) {
      return Response.redirect(new URL("/auth/signin", nextUrl));
    }
  }

  return;
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
