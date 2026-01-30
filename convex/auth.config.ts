import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.NEXTAUTH_URL!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
