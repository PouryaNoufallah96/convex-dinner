import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const toggle = mutation({
  args: {
    visitorId: v.string(),
    visitorName: v.string(),
    placeId: v.string(),
  },
  handler: async (ctx, { visitorId, visitorName, placeId }) => {
    const existing = await ctx.db
      .query('votes')
      .withIndex('by_visitorAndPlace', (q) =>
        q.eq('visitorId', visitorId).eq('placeId', placeId)
      )
      .first()

    if (existing) {
      await ctx.db.delete(existing._id)
      return { voted: false }
    } else {
      await ctx.db.insert('votes', { visitorId, visitorName, placeId })
      return { voted: true }
    }
  },
})
