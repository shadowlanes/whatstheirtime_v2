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
