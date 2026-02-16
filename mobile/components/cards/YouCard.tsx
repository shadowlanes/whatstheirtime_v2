import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import {
  getDayNightState,
  getDayNightDisplay,
  formatTime,
  getOffsetTime,
} from "@/shared/utils/timeUtils";
import { getGradientColors, getBorderColor } from "@/shared/utils/gradients";
import type { UserLocation } from "@/shared/types";
import type { WeatherData } from "@/shared/types";

interface YouCardProps {
  userLocation: UserLocation | null;
  weather: WeatherData | null;
  offsetMinutes: number;
  onEditPress: () => void;
}

export function YouCard({
  userLocation,
  weather,
  offsetMinutes,
  onEditPress,
}: YouCardProps) {
  if (!userLocation) {
    return (
      <View className="bg-white rounded-2xl p-6 mb-4 mx-4 border border-gray-200">
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          Set Your Location
        </Text>
        <Text className="text-gray-600 mb-4">
          Set your location to see your current time and weather
        </Text>
        <TouchableOpacity
          onPress={onEditPress}
          className="bg-purple-600 rounded-lg px-4 py-3 items-center"
        >
          <Text className="text-white font-semibold">Set Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentTime = getOffsetTime(userLocation.timezone, offsetMinutes);
  const dayNightState = getDayNightState(currentTime);
  const dayNightDisplay = getDayNightDisplay(dayNightState);
  const gradient = getGradientColors(dayNightState);
  const borderColor = getBorderColor(dayNightState);

  return (
    <View className="mx-4 mb-4">
      <LinearGradient
        colors={gradient.colors}
        start={gradient.start}
        end={gradient.end}
        style={{
          borderRadius: 16,
          borderWidth: 2,
          borderColor: borderColor,
          padding: 16,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">{dayNightDisplay.icon}</Text>
            <Text className="text-sm font-medium text-gray-700">
              {dayNightDisplay.label}
            </Text>
          </View>
          <TouchableOpacity onPress={onEditPress} className="p-2">
            <Ionicons name="create-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Location */}
        <Text className="text-xl font-bold text-gray-900 mb-1">You</Text>
        <Text className="text-base text-gray-600 mb-3">
          {userLocation.city}, {userLocation.country}
        </Text>

        {/* Time */}
        <Text className="text-4xl font-bold text-gray-900 mb-4">
          {formatTime(currentTime)}
        </Text>

        {/* Weather & AQI */}
        {weather && (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">{getWeatherEmoji(weather.weatherCategory)}</Text>
              <View>
                <Text className="text-base font-semibold text-gray-900">
                  {Math.round(weather.temperature)}°C
                </Text>
                <Text className="text-sm text-gray-600">
                  {weather.weatherDescription}
                </Text>
              </View>
            </View>

            {weather.airQuality && (
              <View className="bg-white/80 rounded-lg px-3 py-2">
                <Text className="text-xs text-gray-600 mb-1">AQI</Text>
                <Text
                  className="text-base font-bold"
                  style={{ color: getAqiColor(weather.airQuality.aqi) }}
                >
                  {weather.airQuality.aqi}
                </Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

function getWeatherEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    Sunny: "☀️",
    "Partly Cloudy": "⛅",
    Cloudy: "☁️",
    Foggy: "🌫️",
    Drizzle: "🌦️",
    Rainy: "🌧️",
    Snowy: "❄️",
    Stormy: "⛈️",
  };
  return emojiMap[category] || "🌤️";
}

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return "#16a34a"; // green-600
  if (aqi <= 100) return "#eab308"; // yellow-600
  if (aqi <= 150) return "#f97316"; // orange-600
  if (aqi <= 200) return "#dc2626"; // red-600
  if (aqi <= 300) return "#9333ea"; // purple-600
  return "#7f1d1d"; // red-900
}
