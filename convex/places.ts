import { action, internalAction } from './_generated/server'
import { v } from 'convex/values'

// Support both GOOGLE_API_KEY and GOOGLE_PLACES_API_KEY for flexibility
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY

function parsePriceLevel(level: string): number {
  const map: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }
  return map[level] ?? 2
}

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
    // If no API key, return mock data filtered by query
    if (!GOOGLE_API_KEY) {
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

    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.primaryType,places.photos',
        },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radius,
            },
          },
          includedType: 'restaurant',
          maxResultCount: 10,
        }),
      }
    )

    const data = await response.json()

    return (data.places || []).map((place: any) => ({
      placeId: place.id,
      name: place.displayName?.text || 'Unknown',
      address: place.formattedAddress || '',
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      rating: place.rating,
      priceLevel: place.priceLevel ? parsePriceLevel(place.priceLevel) : null,
      cuisine: place.primaryType || null,
      photoReference: place.photos?.[0]?.name || null,
    }))
  },
})

export const getDetails = action({
  args: { placeId: v.string() },
  handler: async (_ctx, { placeId }) => {
    // If mock place or no API key, return mock details
    if (!GOOGLE_API_KEY || placeId.startsWith('mock-')) {
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

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': GOOGLE_API_KEY!,
          'X-Goog-FieldMask':
            'id,displayName,formattedAddress,location,rating,priceLevel,currentOpeningHours,reviews,photos,websiteUri,nationalPhoneNumber',
        },
      }
    )

    const place = await response.json()

    return {
      placeId: place.id,
      name: place.displayName?.text,
      address: place.formattedAddress,
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      rating: place.rating,
      priceLevel: place.priceLevel ? parsePriceLevel(place.priceLevel) : null,
      hours: place.currentOpeningHours?.weekdayDescriptions || [],
      reviews: (place.reviews || []).slice(0, 3).map((r: any) => ({
        rating: r.rating,
        text: r.text?.text,
        author: r.authorAttribution?.displayName,
      })),
      phone: place.nationalPhoneNumber,
      website: place.websiteUri,
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
    if (!GOOGLE_API_KEY) {
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

    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.primaryType,places.photos',
        },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radius,
            },
          },
          includedType: 'restaurant',
          maxResultCount: 10,
        }),
      }
    )

    const data = await response.json()

    return (data.places || []).map((place: any) => ({
      placeId: place.id,
      name: place.displayName?.text || 'Unknown',
      address: place.formattedAddress || '',
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      rating: place.rating,
      priceLevel: place.priceLevel ? parsePriceLevel(place.priceLevel) : null,
      cuisine: place.primaryType || null,
      photoReference: place.photos?.[0]?.name || null,
    }))
  },
})

export const getDetailsInternal = internalAction({
  args: { placeId: v.string() },
  handler: async (_ctx, { placeId }) => {
    if (!GOOGLE_API_KEY || placeId.startsWith('mock-')) {
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

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': GOOGLE_API_KEY!,
          'X-Goog-FieldMask':
            'id,displayName,formattedAddress,location,rating,priceLevel,currentOpeningHours,reviews,photos,websiteUri,nationalPhoneNumber',
        },
      }
    )

    const place = await response.json()

    return {
      placeId: place.id,
      name: place.displayName?.text,
      address: place.formattedAddress,
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      rating: place.rating,
      priceLevel: place.priceLevel ? parsePriceLevel(place.priceLevel) : null,
      hours: place.currentOpeningHours?.weekdayDescriptions || [],
      reviews: (place.reviews || []).slice(0, 3).map((r: any) => ({
        rating: r.rating,
        text: r.text?.text,
        author: r.authorAttribution?.displayName,
      })),
      phone: place.nationalPhoneNumber,
      website: place.websiteUri,
    }
  },
})
