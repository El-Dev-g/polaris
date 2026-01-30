import { ConvexHttpClient } from "convex/browser";

/**
 * Convex client for server-side usage.
 * Renamed to Convex and initialized with an object to match user request.
 */
export const Convex = class extends ConvexHttpClient {
  constructor({ url }: { url: string }) {
    super(url);
  }
};

export const convex = new Convex({
  url: process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || ""
});
