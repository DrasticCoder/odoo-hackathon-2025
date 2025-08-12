import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  selectedLocation: string | null;
  coordinates: { lat: number; lng: number } | null;
}

interface LocationActions {
  setLocation: (location: string) => void;
  setCoordinates: (coordinates: { lat: number; lng: number }) => void;
  clearLocation: () => void;
}

export type LocationStore = LocationState & LocationActions;

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      selectedLocation: null,
      coordinates: null,

      setLocation: (location: string) => {
        set({ selectedLocation: location });
      },

      setCoordinates: (coordinates: { lat: number; lng: number }) => {
        set({ coordinates });
      },

      clearLocation: () => {
        set({ selectedLocation: null, coordinates: null });
      },
    }),
    {
      name: 'location-store',
    }
  )
);
