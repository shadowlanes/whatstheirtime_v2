import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import {
  getDayNightState,
  getDayNightDisplay,
  formatTime,
  formatSmartDate,
  getOffsetTime,
} from "@/shared/utils/timeUtils";
import { getGradientColors, getBorderColor } from "@/shared/utils/gradients";
import type { Friend } from "@/shared/types";
import type { WeatherData } from "@/shared/types";

interface FriendCardProps {
  friend: Friend;
  weather: WeatherData | null;
  offsetMinutes: number;
  userTimezone?: string;
  onEditPress: () => void;
  onDeletePress: () => void;
  drag?: () => void;
}

export function FriendCard({
  friend,
  weather,
  offsetMinutes,
  userTimezone,
  onEditPress,
  onDeletePress,
  drag,
}: FriendCardProps) {
  const friendTime = getOffsetTime(friend.timezone, offsetMinutes);
  const dayNightState = getDayNightState(friendTime);
  const dayNightDisplay = getDayNightDisplay(dayNightState);
  const gradient = getGradientColors(dayNightState);
  const borderColor = getBorderColor(dayNightState);

  // Calculate smart date if user timezone is available
  let smartDate = "";
  if (userTimezone) {
    const userTime = getOffsetTime(userTimezone, offsetMinutes);
    smartDate = formatSmartDate(friendTime, userTime);
  }

  return (
    <View className="mx-4 mb-3">
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
        {/* Header with drag handle and actions */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            {/* Drag Handle */}
            {drag && (
              <TouchableOpacity onLongPress={drag} className="mr-2 p-1">
                <Ionicons name="menu" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}

            {/* Day/Night Indicator */}
            <Text className="text-2xl mr-2">{dayNightDisplay.icon}</Text>
            <Text className="text-sm font-medium text-gray-700">
              {dayNightDisplay.label}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onEditPress} className="p-2">
              <Ionicons name="create-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDeletePress} className="p-2">
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Friend Name */}
        <Text className="text-xl font-bold text-gray-900 mb-1">
          {friend.name}
        </Text>

        {/* Location */}
        <Text className="text-base text-gray-600 mb-3">
          {getFlag(friend.country)} {friend.city}, {friend.country}
        </Text>

        {/* Time and Date */}
        <View className="flex-row items-baseline mb-4">
          <Text className="text-4xl font-bold text-gray-900">
            {formatTime(friendTime)}
          </Text>
          {smartDate && smartDate !== "Today" && (
            <Text className="text-base text-gray-600 ml-3">{smartDate}</Text>
          )}
        </View>

        {/* Weather & AQI */}
        {weather && (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">
                {getWeatherEmoji(weather.weatherCategory)}
              </Text>
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

function getFlag(country: string): string {
  // Common country to flag emoji mapping
  // You can expand this or use a library like country-flag-emoji
  const flagMap: Record<string, string> = {
    USA: "🇺🇸",
    "United States": "🇺🇸",
    UK: "🇬🇧",
    "United Kingdom": "🇬🇧",
    Canada: "🇨🇦",
    Australia: "🇦🇺",
    India: "🇮🇳",
    China: "🇨🇳",
    Japan: "🇯🇵",
    Germany: "🇩🇪",
    France: "🇫🇷",
    Italy: "🇮🇹",
    Spain: "🇪🇸",
    Brazil: "🇧🇷",
    Mexico: "🇲🇽",
    Russia: "🇷🇺",
  };

  return flagMap[country] || "🌍";
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
