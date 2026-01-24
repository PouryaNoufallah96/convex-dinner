// NOTE: This file is kept for backwards compatibility.
// The main chat functionality now uses the Convex Agent component.
// These functions are no longer used by the main chat flow but
// are kept in case they're needed for migration or debugging.

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List legacy messages (no longer used by main chat)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("asc").take(100);
  },
});

// Send legacy message (no longer used by main chat)
export const send = mutation({
  args: {
    senderName: v.string(),
    content: v.string(),
    isAi: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      senderName: args.senderName,
      content: args.content,
      isAi: args.isAi,
    });
  },
});

// Clear legacy messages (no longer used by main chat)
export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    await Promise.all(messages.map((m) => ctx.db.delete(m._id)));
  },
});
