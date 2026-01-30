import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const requestSchema = z.object({
  messageId: z.string(),
});

export async function POST(request: Request) {
  const session = await auth(); const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const internalKey = process.env.PRIGIDFY_STUDIO_CONVEX_INTERNAL_KEY || "fallback_key_change_me_in_production";

  const body = await request.json();
  const { messageId } = requestSchema.parse(body);

  await convex.mutation(api.system.updateMessageStatus, {
    internalKey,
    messageId: messageId as Id<"messages">,
    status: "cancelled",
  });

  return NextResponse.json({
    success: true,
  });
};
