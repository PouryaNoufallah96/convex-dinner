export interface Restaurant {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  rating: number | null
  priceLevel: number | null
  cuisine: string | null
  photoUrl?: string | null
}

export interface RestaurantDetails extends Restaurant {
  hours: string[]
  reviews: Array<{
    rating: number
    text: string
    author: string
  }>
  phone: string | null
  website: string | null
}

// Portland-area mock restaurants for development
export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    placeId: 'mock-1',
    name: 'Pok Pok',
    address: '3226 SE Division St, Portland, OR 97202',
    lat: 45.5048,
    lng: -122.6344,
    rating: 4.5,
    priceLevel: 2,
    cuisine: 'Thai',
  },
  {
    placeId: 'mock-2',
    name: "Tony's Pizza Napoletana",
    address: '1570 NW 23rd Ave, Portland, OR 97210',
    lat: 45.5311,
    lng: -122.6985,
    rating: 4.2,
    priceLevel: 1,
    cuisine: 'Italian',
  },
  {
    placeId: 'mock-3',
    name: "Güero's Taco Bar",
    address: '838 E Burnside St, Portland, OR 97214',
    lat: 45.5234,
    lng: -122.6551,
    rating: 4.7,
    priceLevel: 2,
    cuisine: 'Mexican',
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
  },
  {
    placeId: 'mock-9',
    name: 'Departure',
    address: '525 SW Morrison St, Portland, OR 97204',
    lat: 45.5193,
    lng: -122.6761,
    rating: 4.3,
    priceLevel: 3,
    cuisine: 'Asian Fusion',
  },
  {
    placeId: 'mock-10',
    name: "Mother's Bistro",
    address: '212 SW Stark St, Portland, OR 97204',
    lat: 45.5207,
    lng: -122.6733,
    rating: 4.5,
    priceLevel: 2,
    cuisine: 'American',
  },
]

// Default Portland location
export const DEFAULT_LOCATION = {
  lat: 45.5152,
  lng: -122.6784,
  name: 'Portland, OR',
}
