import { action, internalAction } from './_generated/server'
import { v } from 'convex/values'

// Helper to get API key at runtime (not module load time)
function getGoogleApiKey(): string | undefined {
  const key = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY
  console.log('[Places API] GOOGLE_API_KEY present:', !!key, 'length:', key?.length || 0)
  return key
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

// Mock data for development without Google API
const MOCK_RESTAURANTS = [
  {
    placeId: 'mock-1',
    name: 'Pok Pok',
    address: '3226 SE Division St, Portland, OR 97202',
    lat: 45.5048,
    lng: -122.6344,
    rating: 4.5,
    priceLevel: 2,
    cuisine: 'Thai',
    photoReference: null,
  },
  {
    placeId: 'mock-2',
    name: "Tony's Pizza Napoletana",
    address: '1570 Stockton St, San Francisco, CA 94133',
    lat: 45.5231,
    lng: -122.6765,
    rating: 4.2,
    priceLevel: 1,
    cuisine: 'Italian',
    photoReference: null,
  },
  {
    placeId: 'mock-3',
    name: "Güero's Taco Bar",
    address: '1412 S Congress Ave, Austin, TX 78704',
    lat: 45.5155,
    lng: -122.6789,
    rating: 4.7,
    priceLevel: 2,
    cuisine: 'Mexican',
    photoReference: null,
  },
  {
    placeId: 'mock-4',
    name: 'Le Pigeon',
    address: '738 E Burnside St, Portland, OR 97214',
    lat: 45.5234,
    lng: -122.6567,
    rating: 4.6,
    priceLevel: 4,
    cuisine: 'French',
    photoReference: null,
  },
  {
    placeId: 'mock-5',
    name: 'Afuri Ramen',
    address: '50 SW 3rd Ave, Portland, OR 97204',
    lat: 45.5189,
    lng: -122.6732,
    rating: 4.4,
    priceLevel: 2,
    cuisine: 'Japanese',
    photoReference: null,
  },
  {
    placeId: 'mock-6',
    name: 'Screen Door',
    address: '2337 E Burnside St, Portland, OR 97214',
    lat: 45.5231,
    lng: -122.6422,
    rating: 4.5,
    priceLevel: 2,
    cuisine: 'Southern',
    photoReference: null,
  },
  {
    placeId: 'mock-7',
    name: 'Canard',
    address: '734 E Burnside St, Portland, OR 97214',
    lat: 45.5234,
    lng: -122.6569,
    rating: 4.3,
    priceLevel: 3,
    cuisine: 'Wine Bar',
    photoReference: null,
  },
  {
    placeId: 'mock-8',
    name: 'Lardo',
    address: '1205 SW Washington St, Portland, OR 97205',
    lat: 45.5208,
    lng: -122.6831,
    rating: 4.4,
    priceLevel: 1,
    cuisine: 'Sandwiches',
    photoReference: null,
  },
]

export const searchNearby = action({
  args: {
    query: v.string(),
    lat: v.number(),
    lng: v.number(),
    radius: v.optional(v.number()), // meters, default 5000
  },
  handler: async (_ctx, { query, lat, lng, radius = 5000 }) => {
    const apiKey = getGoogleApiKey()
    
    // If no API key, return mock data filtered by query
    if (!apiKey) {
      console.log('Using mock restaurant data (no GOOGLE_PLACES_API_KEY)')
      const lowerQuery = query.toLowerCase()
      return MOCK_RESTAURANTS.filter(
        (r) =>
          r.name.toLowerCase().includes(lowerQuery) ||
          r.cuisine?.toLowerCase().includes(lowerQuery) ||
          lowerQuery.includes('restaurant') ||
          lowerQuery.includes('food') ||
          lowerQuery.includes('dinner') ||
          lowerQuery.includes('eat')
      ).slice(0, 5)
    }

    // Use old Places API (textsearch endpoint)
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
    
    // If mock place or no API key, return mock details
    if (!apiKey || placeId.startsWith('mock-')) {
      const mockRestaurant = MOCK_RESTAURANTS.find(
        (r) => r.placeId === placeId
      )
      if (mockRestaurant) {
        return {
          ...mockRestaurant,
          hours: [
            'Monday: 11:00 AM – 10:00 PM',
            'Tuesday: 11:00 AM – 10:00 PM',
            'Wednesday: 11:00 AM – 10:00 PM',
            'Thursday: 11:00 AM – 10:00 PM',
            'Friday: 11:00 AM – 11:00 PM',
            'Saturday: 10:00 AM – 11:00 PM',
            'Sunday: 10:00 AM – 9:00 PM',
          ],
          reviews: [
            {
              rating: 5,
              text: 'Amazing food! Highly recommend.',
              author: 'Local Guide',
            },
            {
              rating: 4,
              text: 'Great atmosphere and friendly staff.',
              author: 'Food Lover',
            },
          ],
          phone: '(503) 555-0123',
          website: 'https://example.com',
        }
      }
    }

    // Use old Places API (details endpoint)
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', 'place_id,name,formatted_address,geometry,rating,price_level,opening_hours,reviews,formatted_phone_number,website,photos')
    url.searchParams.set('key', apiKey!)

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
      console.log('Using mock restaurant data (no GOOGLE_PLACES_API_KEY)')
      const lowerQuery = query.toLowerCase()
      return MOCK_RESTAURANTS.filter(
        (r) =>
          r.name.toLowerCase().includes(lowerQuery) ||
          r.cuisine?.toLowerCase().includes(lowerQuery) ||
          lowerQuery.includes('restaurant') ||
          lowerQuery.includes('food') ||
          lowerQuery.includes('dinner') ||
          lowerQuery.includes('eat')
      ).slice(0, 5)
    }

    // Use old Places API (textsearch endpoint)
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
    
    if (!apiKey || placeId.startsWith('mock-')) {
      const mockRestaurant = MOCK_RESTAURANTS.find(
        (r) => r.placeId === placeId
      )
      if (mockRestaurant) {
        return {
          ...mockRestaurant,
          hours: [
            'Monday: 11:00 AM – 10:00 PM',
            'Tuesday: 11:00 AM – 10:00 PM',
            'Wednesday: 11:00 AM – 10:00 PM',
            'Thursday: 11:00 AM – 10:00 PM',
            'Friday: 11:00 AM – 11:00 PM',
            'Saturday: 10:00 AM – 11:00 PM',
            'Sunday: 10:00 AM – 9:00 PM',
          ],
          reviews: [
            {
              rating: 5,
              text: 'Amazing food! Highly recommend.',
              author: 'Local Guide',
            },
            {
              rating: 4,
              text: 'Great atmosphere and friendly staff.',
              author: 'Food Lover',
            },
          ],
          phone: '(503) 555-0123',
          website: 'https://example.com',
        }
      }
    }

    // Use old Places API (details endpoint)
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', 'place_id,name,formatted_address,geometry,rating,price_level,opening_hours,reviews,formatted_phone_number,website,photos')
    url.searchParams.set('key', apiKey!)

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
