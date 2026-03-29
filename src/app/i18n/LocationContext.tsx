import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppLocation = "india" | "uk" | "usa";

type LocationContextValue = {
  location: AppLocation;
  setLocation: (location: AppLocation) => void;
};

const LOCATION_STORAGE_KEY = "cyberguard-location";
const SUPPORTED_LOCATIONS = new Set<AppLocation>(["india", "uk", "usa"]);

const LocationContext = createContext<LocationContextValue | null>(null);

const getInitialLocation = (): AppLocation => {
  if (typeof window === "undefined") {
    return "india";
  }
  const stored = window.localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!stored) {
    return "india";
  }
  if (SUPPORTED_LOCATIONS.has(stored as AppLocation)) {
    return stored as AppLocation;
  }
  return "india";
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<AppLocation>(getInitialLocation);

  useEffect(() => {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, location);
  }, [location]);

  const value = useMemo<LocationContextValue>(
    () => ({
      location,
      setLocation,
    }),
    [location],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationSelection() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationSelection must be used within LocationProvider");
  }
  return context;
}
