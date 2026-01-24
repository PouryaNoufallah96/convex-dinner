import { v } from "convex/values";
import { 
  action, 
  mutation, 
  query,
} from "./_generated/server";
import { components } from "./_generated/api";
import { 
  createThread, 
  listUIMessages, 
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { dinnerAgent } from "./dinnerAgent";

// Get or create the shared dinner thread
export const getOrCreateThread = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we have an existing thread stored
    const existing = await ctx.db.query("dinnerThread").first();
    if (existing) {
      return existing.threadId;
    }

    // Create a new thread - returns threadId directly as a string
    const threadId = await createThread(ctx, components.agent, {});

    // Store the thread ID
    await ctx.db.insert("dinnerThread", { threadId });

    return threadId;
  },
});

// Get the current thread ID (if exists)
export const getThread = query({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("dinnerThread").first();
    return existing?.threadId ?? null;
  },
});

// Send a message to the chat
// This action runs on the Convex server and handles AI generation
export const sendMessage = action({
  args: {
    threadId: v.string(),
    content: v.string(),
    senderName: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  handler: async (ctx, { threadId, content, senderName, lat, lng }) => {
    // Check if the message mentions @ai
    const mentionsAi = content.toLowerCase().includes("@ai");

    if (mentionsAi) {
      // Generate AI response with streaming deltas
      // The AI runs HERE on the Convex server
      // Deltas are saved to DB and streamed to all subscribers
      
      // Create a custom context that includes the sender info and location
      // Tools can access these via (ctx as any).senderName, etc.
      const customCtx = Object.assign({}, ctx, {
        senderName,
        lat: lat ?? 45.5152,
        lng: lng ?? -122.6784,
      });

      const result = await dinnerAgent.streamText(
        customCtx,
        { threadId },
        {
          // The user's message - will be saved automatically
          prompt: `[${senderName}]: ${content}`,
        },
        {
          // Enable delta streaming - this is the magic!
          // All connected clients will see the response as it streams
          saveStreamDeltas: {
            chunking: "word",
            throttleMs: 100,
          },
        }
      );

      return { success: true, messageId: result.messageId };
    } else {
      // For non-AI messages, save via the agent so it appears in the thread
      const result = await dinnerAgent.saveMessage(ctx, {
        threadId,
        prompt: `[${senderName}]: ${content}`,
      });

      return { success: true, messageId: result.messageId };
    }
  },
});

// List messages with streaming support
// This query is reactive - clients subscribe and get updates automatically
export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    // Get regular messages with pagination
    const messages = await listUIMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    // Get any active streams (for live AI responses)
    const streams = await syncStreams(ctx, components.agent, {
      threadId: args.threadId,
      streamArgs: args.streamArgs,
    });

    return { ...messages, streams };
  },
});

// Simple message list with streaming support
// useUIMessages requires paginationOpts to be accepted
export const listAllMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const messages = await listUIMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    const streams = await syncStreams(ctx, components.agent, {
      threadId: args.threadId,
      streamArgs: args.streamArgs,
    });

    return { ...messages, streams };
  },
});

// Clear the chat (reset for demo purposes)
export const clearChat = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete the thread reference - a new one will be created
    const existing = await ctx.db.query("dinnerThread").first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    // Note: The messages in the Agent component's storage will remain
    // but won't be accessible since we lost the thread ID
  },
});
