import { create } from "zustand";

interface Offset {
  x: number;
  y: number;
}

export interface GeoState {
  zoom: number;
  offset: Offset;
  selectedCountry: string | null;
  countryPaths: { name: string; path: Path2D }[];
  setZoom: (z: number) => void;
  setOffset: (o: Offset) => void;
  setSelectedCountry: (name: string | null) => void;
  setCountryPaths: (paths: { name: string; path: Path2D }[]) => void;
}

export const useGeoState = create<GeoState>((set) => ({
  zoom: 1,
  offset: { x: 0, y: 0 },
  selectedCountry: null,
  countryPaths: [],
  setZoom: (zoom) => set({ zoom }),
  setOffset: (offset) => set({ offset }),
  setSelectedCountry: (name) => set({ selectedCountry: name }),
  setCountryPaths: (paths) => set({ countryPaths: paths }),
}));