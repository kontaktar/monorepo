// @ts-expect-error - clerkMiddleware exists at runtime but types are incorrect in v6.37.3
import { clerkMiddleware } from "@clerk/nextjs/server";

// For Clerk v6, all routes are public by default
// Protect specific routes by using auth() in server components/API routes
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
