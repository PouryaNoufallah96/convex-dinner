import { create } from "zustand";
import { DEFAULT_LOCATION, type UserLocation } from "@/lib/location";

interface MapState {
  center: UserLocation;
  zoom: number;
  highlightedPlaceId: string | null;
  // Actions
  setCenter: (center: UserLocation) => void;
  setZoom: (zoom: number) => void;
  highlightPlace: (placeId: string | null) => void;
  panTo: (location: UserLocation, zoom?: number) => void;
  reset: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: DEFAULT_LOCATION,
  zoom: 13,
  highlightedPlaceId: null,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  highlightPlace: (placeId) => set({ highlightedPlaceId: placeId }),

  panTo: (location, zoom) =>
    set((state) => ({
      center: location,
      zoom: zoom ?? state.zoom,
    })),

  reset: () =>
    set({
      center: DEFAULT_LOCATION,
      zoom: 13,
      highlightedPlaceId: null,
    }),
}));
