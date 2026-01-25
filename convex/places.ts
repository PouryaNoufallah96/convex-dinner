import { action, internalAction } from './_generated/server'
import { v } from 'convex/values'

// Helper to get API key at runtime (not module load time)
function getGoogleApiKey(): string | undefined {
  return process.env.GOOGLE_API_KEY
}

// Test action to verify Places API is working
export const testPlacesApi = action({
  args: {},
  handler: async () => {
    const apiKey = getGoogleApiKey()
    
    if (!apiKey) {
      return { success: false, error: 'No API key found', envKeys: Object.keys(process.env).filter(k => k.includes('GOOGLE')) }
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    url.searchParams.set('query', 'Indian restaurants in Portland OR')
    url.searchParams.set('type', 'restaurant')
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    return {
      success: data.status === 'OK',
      status: data.status,
      error: data.error_message,
      resultCount: data.results?.length || 0,
      firstResult: data.results?.[0]?.name || null,
    }
  },
})

export const searchNearby = action({
  args: {
    query: v.string(),
    lat: v.number(),
    lng: v.number(),
    radius: v.optional(v.number()), // meters, default 5000
  },
  handler: async (_ctx, { query, lat, lng, radius = 5000 }) => {
    const apiKey = getGoogleApiKey()
    
    if (!apiKey) {
      return []
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    url.searchParams.set('query', query)
    url.searchParams.set('location', `${lat},${lng}`)
    url.searchParams.set('radius', String(radius))
    url.searchParams.set('type', 'restaurant')
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status, data.error_message)
      return []
    }

    return (data.results || []).slice(0, 10).map((place: any) => ({
      placeId: place.place_id,
      name: place.name || 'Unknown',
      address: place.formatted_address || '',
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating,
      priceLevel: place.price_level ?? null,
      cuisine: place.types?.[0] || null,
      photoReference: place.photos?.[0]?.photo_reference || null,
    }))
  },
})

export const getDetails = action({
  args: { placeId: v.string() },
  handler: async (_ctx, { placeId }) => {
    const apiKey = getGoogleApiKey()
    
    if (!apiKey) {
      return null
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', 'place_id,name,formatted_address,geometry,rating,price_level,opening_hours,reviews,formatted_phone_number,website,photos')
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Places API error:', data.status, data.error_message)
      return null
    }

    const place = data.result

    return {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating,
      priceLevel: place.price_level ?? null,
      hours: place.opening_hours?.weekday_text || [],
      reviews: (place.reviews || []).slice(0, 3).map((r: any) => ({
        rating: r.rating,
        text: r.text,
        author: r.author_name,
      })),
      phone: place.formatted_phone_number,
      website: place.website,
    }
  },
})

// Internal versions for calling from other actions (e.g., from the AI agent)
export const searchNearbyInternal = internalAction({
  args: {
    query: v.string(),
    lat: v.number(),
    lng: v.number(),
    radius: v.optional(v.number()),
  },
  handler: async (_ctx, { query, lat, lng, radius = 5000 }) => {
    const apiKey = getGoogleApiKey()
    
    if (!apiKey) {
      return []
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    url.searchParams.set('query', query)
    url.searchParams.set('location', `${lat},${lng}`)
    url.searchParams.set('radius', String(radius))
    url.searchParams.set('type', 'restaurant')
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status, data.error_message)
      return []
    }

    return (data.results || []).slice(0, 10).map((place: any) => ({
      placeId: place.place_id,
      name: place.name || 'Unknown',
      address: place.formatted_address || '',
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating,
      priceLevel: place.price_level ?? null,
      cuisine: place.types?.[0] || null,
      photoReference: place.photos?.[0]?.photo_reference || null,
    }))
  },
})

export const getDetailsInternal = internalAction({
  args: { placeId: v.string() },
  handler: async (_ctx, { placeId }) => {
    const apiKey = getGoogleApiKey()
    
    if (!apiKey) {
      return null
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', 'place_id,name,formatted_address,geometry,rating,price_level,opening_hours,reviews,formatted_phone_number,website,photos')
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Places API error:', data.status, data.error_message)
      return null
    }

    const place = data.result

    return {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating,
      priceLevel: place.price_level ?? null,
      hours: place.opening_hours?.weekday_text || [],
      reviews: (place.reviews || []).slice(0, 3).map((r: any) => ({
        rating: r.rating,
        text: r.text,
        author: r.author_name,
      })),
      phone: place.formatted_phone_number,
      website: place.website,
    }
  },
})
