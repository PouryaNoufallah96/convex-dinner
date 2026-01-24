import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Shared thread reference for the dinner chat
  // All users share a single thread for multi-user chat
  dinnerThread: defineTable({
    threadId: v.string(),
  }),

  // Legacy chat messages (can be removed once migration is complete)
  messages: defineTable({
    senderName: v.string(),
    content: v.string(),
    isAi: v.boolean(),
  }),

  // Shortlisted restaurants
  shortlist: defineTable({
    placeId: v.string(),
    name: v.string(),
    address: v.string(),
    cuisine: v.optional(v.string()),
    rating: v.optional(v.number()),
    priceLevel: v.optional(v.number()), // 1-4
    lat: v.number(),
    lng: v.number(),
    photoUrl: v.optional(v.string()),
    addedBy: v.string(),
  }).index('by_placeId', ['placeId']),

  // Votes (separate table for clean updates)
  votes: defineTable({
    visitorId: v.string(),
    visitorName: v.string(),
    placeId: v.string(),
  })
    .index('by_place', ['placeId'])
    .index('by_visitorAndPlace', ['visitorId', 'placeId']),
})
