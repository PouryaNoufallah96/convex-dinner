import { MapPin } from 'lucide-react'

interface RestaurantPinProps {
  name: string
  isHighlighted?: boolean
  onClick?: () => void
}

export default function RestaurantPin({
  name,
  isHighlighted,
  onClick,
}: RestaurantPinProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center transition-transform ${
        isHighlighted ? 'scale-125 z-10' : 'hover:scale-110'
      }`}
    >
      <div
        className={`${
          isHighlighted
            ? 'bg-amber-500 text-white'
            : 'bg-red-500 text-white group-hover:bg-amber-500'
        } rounded-full p-1.5 shadow-lg transition-colors`}
      >
        <MapPin className="w-4 h-4" />
      </div>
      <div
        className={`absolute -bottom-6 whitespace-nowrap text-xs font-medium px-2 py-1 rounded ${
          isHighlighted
            ? 'bg-amber-500 text-white'
            : 'bg-gray-800 text-gray-200 opacity-0 group-hover:opacity-100'
        } transition-opacity shadow-lg`}
      >
        {name}
      </div>
    </button>
  )
}
