import { useState, useEffect, useCallback } from "react";
import { userApi } from "@/lib/apiClient";
import type { UserLocation, SetUserLocationInput } from "@/shared/types";

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user location on mount
  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const location = await userApi.getLocation();
      setUserLocation(location);
    } catch (err) {
      console.error("Error loading user location:", err);
      setError("Failed to load user location");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLocation = useCallback(
    async (input: SetUserLocationInput): Promise<UserLocation | null> => {
      try {
        const location = await userApi.setLocation(input);
        setUserLocation(location);
        return location;
      } catch (err) {
        console.error("Error setting user location:", err);
        setError("Failed to set user location");
        return null;
      }
    },
    []
  );

  const deleteLocation = useCallback(async (): Promise<boolean> => {
    try {
      await userApi.deleteLocation();
      setUserLocation(null);
      return true;
    } catch (err) {
      console.error("Error deleting user location:", err);
      setError("Failed to delete user location");
      return false;
    }
  }, []);

  return {
    userLocation,
    isLoading,
    error,
    loadUserLocation,
    setLocation,
    deleteLocation,
  };
}
