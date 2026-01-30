import { z } from "zod";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { anthropic } from "@ai-sdk/anthropic";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../../convex/_generated/api";

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
  try {
    const session = await auth(); const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt } = requestSchema.parse(body);

    console.log("Creating project with prompt:", prompt);

    const { output } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      output: Output.object({ schema: projectSchema }),
      prompt: CREATE_PROJECT_PROMPT.replace("{prompt}", prompt),
    });

    console.log("AI Output:", output);

    const { projectId } = await convex.mutation(
      api.system.createProjectWithConversation,
      {
        projectName: output.projectName,
        conversationTitle: output.conversationTitle,
        ownerId: userId,
      }
    );

    console.log("Project created:", projectId);

    return NextResponse.json({ projectId });
  } catch (error) {
    console.error("CREATE_PROJECT_ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create project" },
      { status: 500 }
    );
  }
};
