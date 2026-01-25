import { mutation, query, internalMutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    const restaurants = await ctx.db.query('shortlist').collect()

    // Get vote counts for each
    const withVotes = await Promise.all(
      restaurants.map(async (r) => {
        const votes = await ctx.db
          .query('votes')
          .withIndex('by_place', (q) => q.eq('placeId', r.placeId))
          .collect()
        return {
          ...r,
          voteCount: votes.length,
          voters: votes.map((v) => v.visitorName),
          voterIds: votes.map((v) => v.visitorId),
        }
      })
    )

    return withVotes.sort((a, b) => b.voteCount - a.voteCount)
  },
})

// Clear all shortlist items (useful for resetting demo)
export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query('shortlist').collect()
    const votes = await ctx.db.query('votes').collect()
    await Promise.all([
      ...items.map((i) => ctx.db.delete(i._id)),
      ...votes.map((v) => ctx.db.delete(v._id)),
    ])
  },
})

// Internal versions for calling from actions (e.g., from the AI agent)
export const addInternal = internalMutation({
  args: {
    placeId: v.string(),
    name: v.string(),
    address: v.string(),
    cuisine: v.optional(v.string()),
    rating: v.optional(v.number()),
    priceLevel: v.optional(v.number()),
    lat: v.number(),
    lng: v.number(),
    photoUrl: v.optional(v.string()),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('shortlist')
      .withIndex('by_placeId', (q) => q.eq('placeId', args.placeId))
      .first()

    if (existing) {
      return { success: false, reason: 'Already on shortlist' }
    }

    await ctx.db.insert('shortlist', {
      placeId: args.placeId,
      name: args.name,
      address: args.address,
      cuisine: args.cuisine,
      rating: args.rating,
      priceLevel: args.priceLevel,
      lat: args.lat,
      lng: args.lng,
      photoUrl: args.photoUrl,
      addedBy: args.addedBy,
    })

    return { success: true }
  },
})

export const removeInternal = internalMutation({
  args: { placeId: v.string() },
  handler: async (ctx, { placeId }) => {
    const item = await ctx.db
      .query('shortlist')
      .withIndex('by_placeId', (q) => q.eq('placeId', placeId))
      .first()

    if (item) {
      const votes = await ctx.db
        .query('votes')
        .withIndex('by_place', (q) => q.eq('placeId', placeId))
        .collect()

      await Promise.all(votes.map((v) => ctx.db.delete(v._id)))
      await ctx.db.delete(item._id)
    }
  },
})
