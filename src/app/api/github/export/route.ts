import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const requestSchema = z.object({
  projectId: z.string(),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // NOTE: Bypassing pro plan check as we removed Clerk
  // const hasPro = has({ plan: "pro" });

  const body = await request.json();
  const { projectId } = requestSchema.parse(body);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const githubToken = (session as any).accessToken;

  if (!githubToken) {
    return NextResponse.json(
      { error: "GitHub not connected. Please reconnect your GitHub account." },
      { status: 400 }
    );
  }

  const internalKey = process.env.PRIGIDFY_STUDIO_CONVEX_INTERNAL_KEY || "fallback_key_change_me_in_production";

  await convex.mutation(api.system.updateExportStatus, {
    internalKey,
    projectId: projectId as Id<"projects">,
    status: "exporting",
  });

  const event = await inngest.send({
    name: "github/export.repo",
    data: {
      projectId,
      githubToken,
    },
  });

  return NextResponse.json({
    success: true,
    eventId: event.ids[0],
  });
};
