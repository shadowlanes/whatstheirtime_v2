import { useState, useCallback, useEffect } from "react";
import { storage } from "@/lib/storage";
import { Config } from "@/constants/Config";
import { createWeatherUtils } from "@/shared/utils/weatherUtils";
import type { WeatherData } from "@/shared/types";

// Create weather utils instance with AsyncStorage adapter
const weatherUtils = createWeatherUtils(storage, Config.API_URL);

export function useWeather(city?: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load weather when city changes
  useEffect(() => {
    if (city) {
      loadWeather(city);
    }
  }, [city]);

  const loadWeather = useCallback(async (cityName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await weatherUtils.getWeatherForCity(cityName);
      setWeather(data);
    } catch (err) {
      console.error("Error loading weather:", err);
      setError("Failed to load weather");
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshWeather = useCallback(async (cityName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await weatherUtils.refreshWeatherForCity(cityName);
      setWeather(data);
    } catch (err) {
      console.error("Error refreshing weather:", err);
      setError("Failed to refresh weather");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await weatherUtils.clearAllWeatherCache();
    } catch (err) {
      console.error("Error clearing weather cache:", err);
    }
  }, []);

  return {
    weather,
    isLoading,
    error,
    loadWeather,
    refreshWeather,
    clearCache,
  };
}

// Hook for loading multiple cities' weather
export function useMultipleWeather(cities: string[]) {
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadAllWeather = useCallback(async () => {
    if (cities.length === 0) return;

    try {
      setIsLoading(true);
      const weatherPromises = cities.map(async (city) => {
        try {
          const data = await weatherUtils.getWeatherForCity(city);
          return { city, data };
        } catch (err) {
          console.error(`Error loading weather for ${city}:`, err);
          return { city, data: null };
        }
      });

      const results = await Promise.all(weatherPromises);

      const newWeatherMap: Record<string, WeatherData | null> = {};
      results.forEach(({ city, data }) => {
        newWeatherMap[city] = data;
      });

      setWeatherMap(newWeatherMap);
    } catch (err) {
      console.error("Error loading multiple weather:", err);
    } finally {
      setIsLoading(false);
    }
  }, [cities.join(",")]);

  useEffect(() => {
    loadAllWeather();
  }, [loadAllWeather]);

  return {
    weatherMap,
    isLoading,
    loadAllWeather,
  };
}
