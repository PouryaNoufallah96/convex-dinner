import { DEFAULT_LOCATION } from '@/data/mock-restaurants'

export interface UserLocation {
  lat: number
  lng: number
}

export async function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      // Fallback to Portland, OR
      resolve(DEFAULT_LOCATION)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => {
        // Fallback on error/denial
        resolve(DEFAULT_LOCATION)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 600000, // Cache for 10 minutes
      }
    )
  })
}

// Get stored location or fetch new one
let cachedLocation: UserLocation | null = null

export async function getCachedLocation(): Promise<UserLocation> {
  if (cachedLocation) return cachedLocation
  cachedLocation = await getUserLocation()
  return cachedLocation
}

export function clearCachedLocation(): void {
  cachedLocation = null
}
