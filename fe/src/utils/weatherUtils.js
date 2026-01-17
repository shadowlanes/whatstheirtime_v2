import cities from "@/data/cities.json";

// Build a map of city names to coordinates from the cities data
const CITY_COORDINATES = cities.reduce((map, city) => {
  map[city.name] = [city.latitude, city.longitude];
  return map;
}, {});

// Map weather codes to descriptions
// Based on WMO Weather interpretation codes
const WEATHER_CODE_DESCRIPTIONS = {
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

// Simplified weather category for display
function getWeatherCategory(code) {
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

// Check if cached weather is still valid (not older than 6 hours)
function isCacheValid(timestamp) {
  const SIX_HOURS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  return Date.now() - timestamp < SIX_HOURS;
}

// Get weather from localStorage or fetch from API
export async function getWeatherForCity(city) {
  const cacheKey = `weather_${city}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (isCacheValid(timestamp)) {
      return data; // Return cached data if still valid
    }
  }

  // Cache is missing or stale, fetch from API
  return fetchWeatherFromAPI(city);
}

// Fetch weather from Open-Meteo API
async function fetchWeatherFromAPI(city) {
  try {
    const coords = CITY_COORDINATES[city];
    if (!coords) {
      console.warn(`Coordinates not found for city: ${city}`);
      return null;
    }

    const [latitude, longitude] = coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    const current = data.current;

    const weatherData = {
      temperature: Math.round(current.temperature_2m),
      weatherCode: current.weather_code,
      weatherDescription: WEATHER_CODE_DESCRIPTIONS[current.weather_code] || "Unknown",
      weatherCategory: getWeatherCategory(current.weather_code),
      fetchedAt: new Date().toISOString(),
    };

    // Store in localStorage with timestamp
    localStorage.setItem(
      `weather_${city}`,
      JSON.stringify({
        data: weatherData,
        timestamp: Date.now(),
      })
    );

    return weatherData;
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return null;
  }
}

// Refresh weather for a city (force fetch from API)
export async function refreshWeatherForCity(city) {
  const cacheKey = `weather_${city}`;
  localStorage.removeItem(cacheKey);
  return getWeatherForCity(city);
}

// Clear all cached weather data
export function clearAllWeatherCache() {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith("weather_")) {
      localStorage.removeItem(key);
    }
  });
}

// Get all cached weather with their ages
export function getAllCachedWeather() {
  const cached = {};
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith("weather_")) {
      const city = key.replace("weather_", "");
      const item = JSON.parse(localStorage.getItem(key));
      cached[city] = {
        ...item.data,
        age: Date.now() - item.timestamp,
        isValid: isCacheValid(item.timestamp),
      };
    }
  });
  return cached;
}
