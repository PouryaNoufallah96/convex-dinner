import { create } from "zustand";
import {
  DEFAULT_LOCATION,
  getUserLocation,
  type UserLocation,
} from "@/lib/location";

interface LocationState {
  userLocation: UserLocation;
  isLoading: boolean;
  // Actions
  fetchLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  userLocation: DEFAULT_LOCATION,
  isLoading: false,

  fetchLocation: async () => {
    set({ isLoading: true });
    const location = await getUserLocation();
    set({ userLocation: location, isLoading: false });
  },
}));
