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

// Get air quality category and label based on US AQI
function getAirQualityInfo(usAqi) {
  if (!usAqi)
    return { category: "Unknown", label: "No Data", color: "text-gray-500" };

  if (usAqi <= 50)
    return {
      category: "Good",
      label: "Good",
      color: "text-green-600 dark:text-green-400",
    };
  if (usAqi <= 100)
    return {
      category: "Moderate",
      label: "Moderate",
      color: "text-yellow-600 dark:text-yellow-400",
    };
  if (usAqi <= 150)
    return {
      category: "Bad",
      label: "Bad",
      color: "text-orange-600 dark:text-orange-400",
    };
  if (usAqi <= 200)
    return {
      category: "Unhealthy",
      label: "Unhealthy",
      color: "text-red-600 dark:text-red-400",
    };
  if (usAqi <= 300)
    return {
      category: "Very Unhealthy",
      label: "Very Unhealthy",
      color: "text-purple-600 dark:text-purple-400",
    };
  return {
    category: "Hazardous",
    label: "Hazardous",
    color: "text-red-900 dark:text-red-700",
  };
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

// Fetch weather and air quality from Open-Meteo API
async function fetchWeatherFromAPI(city) {
  try {
    const coords = CITY_COORDINATES[city];
    if (!coords) {
      console.warn(`Coordinates not found for city: ${city}`);
      return null;
    }

    const [latitude, longitude] = coords;

    // Fetch both weather and air quality in parallel
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`;
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5`;

    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(airQualityUrl),
    ]);

    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.statusText}`);
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    let airQualityData = null;
    if (airQualityResponse.ok) {
      const aqData = await airQualityResponse.json();
      const aqCurrent = aqData.current;
      const aqInfo = getAirQualityInfo(aqCurrent.us_aqi);

      airQualityData = {
        aqi: aqCurrent.us_aqi,
        pm10: aqCurrent.pm10,
        pm25: aqCurrent.pm2_5,
        ...aqInfo,
      };
    }

    const combinedData = {
      temperature: Math.round(current.temperature_2m),
      weatherCode: current.weather_code,
      weatherDescription:
        WEATHER_CODE_DESCRIPTIONS[current.weather_code] || "Unknown",
      weatherCategory: getWeatherCategory(current.weather_code),
      airQuality: airQualityData,
      fetchedAt: new Date().toISOString(),
    };

    // Store in localStorage with timestamp
    localStorage.setItem(
      `weather_${city}`,
      JSON.stringify({
        data: combinedData,
        timestamp: Date.now(),
      }),
    );

    return combinedData;
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
