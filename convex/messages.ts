import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('messages')
      .order('asc')
      .take(100)
  },
})

export const send = mutation({
  args: {
    senderName: v.string(),
    content: v.string(),
    isAi: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('messages', {
      senderName: args.senderName,
      content: args.content,
      isAi: args.isAi,
    })
  },
})

// For streaming AI responses - update message content
export const updateAiMessage = mutation({
  args: {
    messageId: v.id('messages'),
    content: v.string(),
  },
  handler: async (ctx, { messageId, content }) => {
    await ctx.db.patch(messageId, { content })
  },
})

// Clear all messages (useful for resetting demo)
export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query('messages').collect()
    await Promise.all(messages.map((m) => ctx.db.delete(m._id)))
  },
})
