import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./auth";

// Type guard to ensure identity is properly typed
function requireIdentity(identity: { subject?: string } | null): asserts identity is { subject: string } {
  if (!identity || !identity.subject) {
    throw new Error("Not authenticated");
  }
}

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const authIdentity = await verifyAuth(ctx);
    requireIdentity(authIdentity);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== authIdentity.subject) {
      throw new Error("Unauthorized to access this project");
    }

    const conversationId = await ctx.db.insert("conversations", {
      projectId: args.projectId,
      title: args.title,
      updatedAt: Date.now(),
    });

    return conversationId;
  },
});

export const getById = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const authIdentity = await verifyAuth(ctx);
    requireIdentity(authIdentity);

    const conversation = await ctx.db.get(args.id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const project = await ctx.db.get(conversation.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== authIdentity.subject) {
      throw new Error("Unauthorized to access this project");
    }

    return conversation;
  },
});

export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const authIdentity = await verifyAuth(ctx);
    requireIdentity(authIdentity);

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== authIdentity.subject) {
      throw new Error("Unauthorized to access this project");
    }

    return await ctx.db
      .query("conversations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const authIdentity = await verifyAuth(ctx);
    requireIdentity(authIdentity);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const project = await ctx.db.get(conversation.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== authIdentity.subject) {
      throw new Error("Unauthorized to access this project");
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("conversations"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authIdentity = await verifyAuth(ctx);
    requireIdentity(authIdentity);

    const conversation = await ctx.db.get(args.id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const project = await ctx.db.get(conversation.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== authIdentity.subject) {
      throw new Error("Unauthorized to access this project");
    }

    const updates: Partial<typeof conversation> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

export const deleteConversation = mutation({
  args: {
    id: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const authIdentity = await verifyAuth(ctx);
    requireIdentity(authIdentity);

    const conversation = await ctx.db.get(args.id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const project = await ctx.db.get(conversation.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== authIdentity.subject) {
      throw new Error("Unauthorized to access this project");
    }

    // Delete all messages in this conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the conversation
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const authIdentity = await verifyAuth(ctx);
    requireIdentity(authIdentity);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const project = await ctx.db.get(conversation.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.ownerId !== authIdentity.subject) {
      throw new Error("Unauthorized to access this project");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });

    // Update conversation's updatedAt timestamp
    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    });

    return messageId;
  },
});
