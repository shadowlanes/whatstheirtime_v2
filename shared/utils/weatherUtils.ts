// Storage abstraction layer - can be localStorage (web) or AsyncStorage (mobile)
interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
  getAllKeys?(): Promise<string[]> | string[];
}

export interface AirQualityData {
  aqi: number;
  pm10: number;
  pm25: number;
  category: string;
  label: string;
  color: string;
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  weatherCategory: string;
  airQuality: AirQualityData | null;
  fetchedAt: string;
}

interface CachedWeatherData {
  data: WeatherData;
  timestamp: number;
}

// Map weather codes to descriptions
// Based on WMO Weather interpretation codes
const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

/**
 * Simplified weather category for display
 */
export function getWeatherCategory(code: number): string {
  if (code === 0 || code === 1) return "Sunny";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Rainy";
  if (code >= 85 && code <= 86) return "Snowy";
  if (code >= 95 && code <= 99) return "Stormy";
  return "Unknown";
}

/**
 * Get air quality category and label based on US AQI
 */
export function getAirQualityInfo(usAqi?: number): {
  category: string;
  label: string;
  color: string;
} {
  if (!usAqi) {
    return { category: "Unknown", label: "No Data", color: "text-gray-500" };
  }

  if (usAqi <= 50) {
    return {
      category: "Good",
      label: "Good",
      color: "text-green-600 dark:text-green-400",
    };
  }
  if (usAqi <= 100) {
    return {
      category: "Moderate",
      label: "Moderate",
      color: "text-yellow-600 dark:text-yellow-400",
    };
  }
  if (usAqi <= 150) {
    return {
      category: "Bad",
      label: "Bad",
      color: "text-orange-600 dark:text-orange-400",
    };
  }
  if (usAqi <= 200) {
    return {
      category: "Unhealthy",
      label: "Unhealthy",
      color: "text-red-600 dark:text-red-400",
    };
  }
  if (usAqi <= 300) {
    return {
      category: "Very Unhealthy",
      label: "Very Unhealthy",
      color: "text-purple-600 dark:text-purple-400",
    };
  }
  return {
    category: "Hazardous",
    label: "Hazardous",
    color: "text-red-900 dark:text-red-700",
  };
}

/**
 * Check if cached weather is still valid (not older than 60 minutes)
 */
function isCacheValid(timestamp: number): boolean {
  const SIXTY_MINUTES = 60 * 60 * 1000; // 60 minutes in milliseconds
  return Date.now() - timestamp < SIXTY_MINUTES;
}

/**
 * Create a weather utilities instance with the provided storage adapter
 */
export function createWeatherUtils(storage: StorageAdapter, apiUrl: string) {
  /**
   * Fetch weather from backend API
   */
  async function fetchWeatherFromBackend(city: string): Promise<WeatherData | null> {
    try {
      const response = await fetch(`${apiUrl}/api/weather/${encodeURIComponent(city)}`);

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.statusText}`);
      }

      const weatherData = await response.json();

      // Transform backend response to match frontend format
      const combinedData: WeatherData = {
        temperature: weatherData.temperature,
        weatherCode: weatherData.weatherCode,
        weatherDescription: weatherData.weatherDescription,
        weatherCategory: weatherData.weatherCategory,
        airQuality: weatherData.aqi
          ? {
              aqi: weatherData.aqi,
              pm10: weatherData.pm10,
              pm25: weatherData.pm25,
              category: weatherData.aqiCategory,
              label: weatherData.aqiLabel,
              color: weatherData.aqiColor,
            }
          : null,
        fetchedAt: weatherData.fetchedAt,
      };

      // Store in cache with timestamp
      const cacheData: CachedWeatherData = {
        data: combinedData,
        timestamp: Date.now(),
      };

      await storage.setItem(`weather_${city}`, JSON.stringify(cacheData));

      return combinedData;
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      return null;
    }
  }

  /**
   * Get weather from cache or fetch from API
   */
  async function getWeatherForCity(city: string): Promise<WeatherData | null> {
    const cacheKey = `weather_${city}`;
    const cached = await storage.getItem(cacheKey);

    if (cached) {
      try {
        const { data, timestamp }: CachedWeatherData = JSON.parse(cached);
        if (isCacheValid(timestamp)) {
          return data; // Return cached data if still valid
        }
      } catch (error) {
        console.error(`Error parsing cached weather for ${city}:`, error);
      }
    }

    // Cache is missing or stale, fetch from backend
    return fetchWeatherFromBackend(city);
  }

  /**
   * Refresh weather for a city (force fetch from API)
   */
  async function refreshWeatherForCity(city: string): Promise<WeatherData | null> {
    const cacheKey = `weather_${city}`;
    await storage.removeItem(cacheKey);
    return getWeatherForCity(city);
  }

  /**
   * Clear all cached weather data
   */
  async function clearAllWeatherCache(): Promise<void> {
    if (storage.getAllKeys) {
      const keys = await storage.getAllKeys();
      for (const key of keys) {
        if (key.startsWith("weather_")) {
          await storage.removeItem(key);
        }
      }
    } else {
      // Fallback for storage adapters without getAllKeys
      // This works for localStorage
      const storageKeys = Object.keys(storage);
      for (const key of storageKeys) {
        if (key.startsWith("weather_")) {
          await storage.removeItem(key);
        }
      }
    }
  }

  /**
   * Get all cached weather with their ages
   */
  async function getAllCachedWeather(): Promise<
    Record<
      string,
      WeatherData & {
        age: number;
        isValid: boolean;
      }
    >
  > {
    const cached: Record<
      string,
      WeatherData & {
        age: number;
        isValid: boolean;
      }
    > = {};

    if (storage.getAllKeys) {
      const keys = await storage.getAllKeys();
      for (const key of keys) {
        if (key.startsWith("weather_")) {
          const city = key.replace("weather_", "");
          const item = await storage.getItem(key);
          if (item) {
            try {
              const { data, timestamp }: CachedWeatherData = JSON.parse(item);
              cached[city] = {
                ...data,
                age: Date.now() - timestamp,
                isValid: isCacheValid(timestamp),
              };
            } catch (error) {
              console.error(`Error parsing cached weather for ${city}:`, error);
            }
          }
        }
      }
    }

    return cached;
  }

  return {
    getWeatherForCity,
    refreshWeatherForCity,
    clearAllWeatherCache,
    getAllCachedWeather,
  };
}

// Web localStorage adapter
export const webStorageAdapter: StorageAdapter = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
  getAllKeys: () => Object.keys(localStorage),
};
