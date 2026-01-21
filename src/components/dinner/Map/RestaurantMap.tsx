import { useEffect, useState } from 'react'
import { MapPin, ZoomIn, ZoomOut, Navigation } from 'lucide-react'
import { DEFAULT_LOCATION } from '@/data/mock-restaurants'

// Google Maps imports - only used when API key is available
import {
  APIProvider,
  Map,
  AdvancedMarker,
} from '@vis.gl/react-google-maps'

interface MapRestaurant {
  placeId: string
  name: string
  lat: number
  lng: number
}

interface RestaurantMapProps {
  restaurants: MapRestaurant[]
  highlightedPlaceId?: string | null
  center?: { lat: number; lng: number }
  zoom?: number
  onPinClick?: (placeId: string) => void
}

// Get Google Maps API key from environment (check multiple possible names)
const GOOGLE_MAPS_API_KEY = 
  (import.meta as any).env?.VITE_GOOGLE_API_KEY || 
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 
  ''

// Mock map component for when no API key is available
function MockMap({
  restaurants,
  highlightedPlaceId,
  center,
  zoom,
  onPinClick,
}: RestaurantMapProps) {
  const [mapCenter, setMapCenter] = useState(center || DEFAULT_LOCATION)
  const [mapZoom, setMapZoom] = useState(zoom || 13)

  useEffect(() => {
    if (center) setMapCenter(center)
  }, [center])

  useEffect(() => {
    if (zoom) setMapZoom(zoom)
  }, [zoom])

  // Convert lat/lng to pixel position relative to center
  const latLngToPixel = (lat: number, lng: number) => {
    const scale = Math.pow(2, mapZoom - 10) * 100
    const x = (lng - mapCenter.lng) * scale + 50
    const y = (mapCenter.lat - lat) * scale + 50
    return { x: `${x}%`, y: `${y}%` }
  }

  return (
    <div className="relative h-full bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Map header */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-linear-to-b from-gray-900/90 to-transparent z-10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-500" />
          Restaurant Map
          <span className="text-xs text-gray-500 font-normal">(Mock - add VITE_GOOGLE_API_KEY for real map)</span>
        </h2>
      </div>

      {/* Mock map background */}
      <div
        className="relative w-full h-full"
        style={{
          background: `
            linear-gradient(to right, rgba(55, 65, 81, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(55, 65, 81, 0.3) 1px, transparent 1px),
            linear-gradient(135deg, #1f2937 0%, #111827 100%)
          `,
          backgroundSize: '50px 50px, 50px 50px, 100% 100%',
        }}
      >
        {/* Center marker */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-blue-400 whitespace-nowrap">
            You are here
          </div>
        </div>

        {/* Restaurant pins */}
        {restaurants.map((restaurant) => {
          const pos = latLngToPixel(restaurant.lat, restaurant.lng)
          const isHighlighted = highlightedPlaceId === restaurant.placeId
          return (
            <button
              key={restaurant.placeId}
              className="absolute -translate-x-1/2 -translate-y-full group"
              style={{ left: pos.x, top: pos.y }}
              onClick={() => onPinClick?.(restaurant.placeId)}
            >
              <div
                className={`${
                  isHighlighted
                    ? 'bg-amber-500 scale-125'
                    : 'bg-red-500 group-hover:bg-amber-500'
                } rounded-full p-1.5 shadow-lg transition-all`}
              >
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div
                className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium px-2 py-1 rounded ${
                  isHighlighted
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-800 text-gray-200 opacity-0 group-hover:opacity-100'
                } transition-opacity shadow-lg`}
              >
                {restaurant.name}
              </div>
            </button>
          )
        })}

        {/* No restaurants message */}
        {restaurants.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No restaurants to display</p>
              <p className="text-sm">Ask AI to search for restaurants!</p>
            </div>
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div className="absolute right-3 bottom-3 flex flex-col gap-1 z-10">
        <button
          onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded shadow-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMapZoom((z) => Math.max(z - 1, 8))}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded shadow-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMapCenter(DEFAULT_LOCATION)}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded shadow-lg transition-colors"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Location info */}
      <div className="absolute left-3 bottom-3 text-xs text-gray-400 bg-gray-900/80 px-2 py-1 rounded">
        {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)} | Zoom: {mapZoom}
      </div>
    </div>
  )
}

// Real Google Maps component
function GoogleMap({
  restaurants,
  highlightedPlaceId,
  center,
  zoom,
  onPinClick,
}: RestaurantMapProps) {
  const mapCenter = center || DEFAULT_LOCATION

  return (
    <div className="relative h-full rounded-lg border border-gray-700 overflow-hidden">
      {/* Map header */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-linear-to-b from-gray-900/90 to-transparent z-10 pointer-events-none">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-500" />
          Restaurant Map
        </h2>
      </div>

      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={mapCenter}
          center={mapCenter}
          defaultZoom={zoom || 13}
          zoom={zoom || 13}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId="dinner-plans-map"
          style={{ width: '100%', height: '100%' }}
          colorScheme="DARK"
        >
          {/* User location marker */}
          <AdvancedMarker position={DEFAULT_LOCATION}>
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>
          </AdvancedMarker>

          {/* Restaurant markers */}
          {restaurants.map((restaurant) => {
            const isHighlighted = highlightedPlaceId === restaurant.placeId
            return (
              <AdvancedMarker
                key={restaurant.placeId}
                position={{ lat: restaurant.lat, lng: restaurant.lng }}
                onClick={() => onPinClick?.(restaurant.placeId)}
              >
                <div 
                  className={`flex items-center justify-center rounded-full shadow-lg transition-transform cursor-pointer ${
                    isHighlighted 
                      ? 'w-10 h-10 bg-amber-500 border-2 border-amber-600 scale-110' 
                      : 'w-8 h-8 bg-red-500 border-2 border-red-600 hover:scale-110'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </AdvancedMarker>
            )
          })}
        </Map>
      </APIProvider>

      {/* No restaurants message */}
      {restaurants.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white bg-gray-900/80 p-4 rounded-lg">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No restaurants to display</p>
            <p className="text-sm text-gray-400">Ask AI to search for restaurants!</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Main component that chooses between real and mock map
export default function RestaurantMap(props: RestaurantMapProps) {
  // Use real Google Maps if API key is available
  if (GOOGLE_MAPS_API_KEY) {
    return <GoogleMap {...props} />
  }

  // Fall back to mock map
  return <MockMap {...props} />
}
