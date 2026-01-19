import { PrismaClient } from "@prisma/client";
import citiesData from "../data/cities.json";

const prisma = new PrismaClient();

interface City {
  name: string;
  country_code: string;
  timezone_id: string;
  latitude: number;
  longitude: number;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  weatherCategory: string;
  aqi?: number;
  pm10?: number;
  pm25?: number;
  aqiCategory?: string;
  aqiLabel?: string;
  aqiColor?: string;
  fetchedAt: string;
}

// Build a map of city names to coordinates
const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> =
  (citiesData as City[]).reduce((map, city) => {
    map[city.name] = { latitude: city.latitude, longitude: city.longitude };
    return map;
  }, {} as Record<string, { latitude: number; longitude: number }>);

// Map weather codes to descriptions (WMO Weather interpretation codes)
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

// Get simplified weather category for display
function getWeatherCategory(code: number): string {
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
function getAirQualityInfo(usAqi: number | null) {
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

// Get city coordinates from cities.json
export function getCityCoordinates(city: string): { latitude: number; longitude: number } | null {
  return CITY_COORDINATES[city] || null;
}

// Fetch weather and air quality from Open-Meteo API and store in DB
export async function fetchAndStoreWeather(city: string): Promise<WeatherData | null> {
  try {
    const coords = getCityCoordinates(city);
    if (!coords) {
      console.warn(`Coordinates not found for city: ${city}`);
      return null;
    }

    const { latitude, longitude } = coords;

    // Fetch both weather and air quality in parallel
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`;
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5`;

    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(airQualityUrl),
    ]);

    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.statusText}`);
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    let aqi: number | null = null;
    let pm10: number | null = null;
    let pm25: number | null = null;

    // Air quality might fail, store weather with null AQI
    if (airQualityResponse.ok) {
      const aqData = await airQualityResponse.json();
      const aqCurrent = aqData.current;
      aqi = aqCurrent.us_aqi || null;
      pm10 = aqCurrent.pm10 || null;
      pm25 = aqCurrent.pm2_5 || null;
    }

    const temperature = Math.round(current.temperature_2m);
    const weatherCode = current.weather_code;

    // Upsert to database
    await prisma.weather.upsert({
      where: { city },
      update: {
        temperature,
        weatherCode,
        aqi,
        pm10,
        pm25,
      },
      create: {
        city,
        temperature,
        weatherCode,
        aqi,
        pm10,
        pm25,
      },
    });

    // Return formatted data
    const aqInfo = getAirQualityInfo(aqi);
    return {
      temperature,
      weatherCode,
      weatherDescription: WEATHER_CODE_DESCRIPTIONS[weatherCode] || "Unknown",
      weatherCategory: getWeatherCategory(weatherCode),
      aqi: aqi || undefined,
      pm10: pm10 || undefined,
      pm25: pm25 || undefined,
      aqiCategory: aqInfo.category,
      aqiLabel: aqInfo.label,
      aqiColor: aqInfo.color,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return null;
  }
}

// Get weather for city - return from DB if fresh (<60 min), else fetch
export async function getWeatherForCity(city: string): Promise<WeatherData | null> {
  try {
    // Check database for existing weather data
    const dbWeather = await prisma.weather.findUnique({
      where: { city },
    });

    // If data exists and is less than 60 minutes old, return it
    if (dbWeather) {
      const ageInMinutes = (Date.now() - dbWeather.lastUpdated.getTime()) / (1000 * 60);
      if (ageInMinutes < 60) {
        const aqInfo = getAirQualityInfo(dbWeather.aqi);
        return {
          temperature: dbWeather.temperature,
          weatherCode: dbWeather.weatherCode,
          weatherDescription: WEATHER_CODE_DESCRIPTIONS[dbWeather.weatherCode] || "Unknown",
          weatherCategory: getWeatherCategory(dbWeather.weatherCode),
          aqi: dbWeather.aqi || undefined,
          pm10: dbWeather.pm10 || undefined,
          pm25: dbWeather.pm25 || undefined,
          aqiCategory: aqInfo.category,
          aqiLabel: aqInfo.label,
          aqiColor: aqInfo.color,
          fetchedAt: dbWeather.lastUpdated.toISOString(),
        };
      }
    }

    // Data is stale or doesn't exist, fetch fresh data
    return await fetchAndStoreWeather(city);
  } catch (error) {
    console.error(`Error getting weather for ${city}:`, error);
    return null;
  }
}

// Get all unique cities from User and Friend tables
export async function getAllUniqueCities(): Promise<string[]> {
  try {
    const [users, friends] = await Promise.all([
      prisma.user.findMany({
        where: { city: { not: null } },
        select: { city: true },
      }),
      prisma.friend.findMany({
        select: { city: true },
      }),
    ]);

    const cities = new Set<string>();
    users.forEach((user) => {
      if (user.city) cities.add(user.city);
    });
    friends.forEach((friend) => {
      cities.add(friend.city);
    });

    return Array.from(cities);
  } catch (error) {
    console.error("Error getting unique cities:", error);
    return [];
  }
}

// Update weather for multiple cities (used by cron job)
export async function updateWeatherForCities(cities: string[]): Promise<void> {
  console.log(`Updating weather for ${cities.length} cities...`);

  const results = await Promise.allSettled(
    cities.map((city) => fetchAndStoreWeather(city))
  );

  let successCount = 0;
  let failureCount = 0;

  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value) {
      successCount++;
    } else {
      failureCount++;
      console.error(`Failed to update weather for ${cities[index]}`);
    }
  });

  console.log(`Weather update complete: ${successCount} succeeded, ${failureCount} failed`);
}
