import { z } from "zod";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { anthropic } from "@ai-sdk/anthropic";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";

const requestSchema = z.object({
  prompt: z.string(),
});

const projectSchema = z.object({
  projectName: z.string().describe("The name of the project"),
  conversationTitle: z.string().describe("A short title for the conversation"),
});

const CREATE_PROJECT_PROMPT = `You are a project initialization assistant.
Based on the user's prompt, generate a short, descriptive project name and a brief conversation title.

User Prompt: {prompt}

Return the project name and conversation title as a JSON object.`;

export async function POST(request: Request) {
  const session = await auth(); const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const internalKey = process.env.PRIGIDFY_STUDIO_CONVEX_INTERNAL_KEY || "fallback_key_change_me_in_production";

  const body = await request.json();
  const { prompt } = requestSchema.parse(body);

  const { output } = await generateText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    output: Output.object({ schema: projectSchema }),
    prompt: CREATE_PROJECT_PROMPT.replace("{prompt}", prompt),
  });

  const { projectId } = await convex.mutation(
    api.system.createProjectWithConversation,
    {
      internalKey,
      projectName: output.projectName,
      conversationTitle: output.conversationTitle,
      ownerId: userId,
    }
  );

  return NextResponse.json({ projectId });
};
