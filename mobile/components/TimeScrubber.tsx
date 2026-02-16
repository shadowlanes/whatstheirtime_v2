import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { formatTimeOffset } from "@/shared/utils/timeUtils";

interface TimeScrubberProps {
  offsetMinutes: number;
  onOffsetChange: (minutes: number) => void;
  isVisible?: boolean;
  onToggle?: () => void;
}

export function TimeScrubber({
  offsetMinutes,
  onOffsetChange,
  isVisible = false,
  onToggle,
}: TimeScrubberProps) {
  // Convert minutes to hours for display
  const offsetHours = offsetMinutes / 60;

  // Range: -12h to +12h in 15-minute increments
  const minMinutes = -12 * 60; // -720 minutes
  const maxMinutes = 12 * 60; // 720 minutes
  const step = 15; // 15-minute increments

  const handleReset = () => {
    onOffsetChange(0);
  };

  if (!isVisible) {
    return onToggle ? (
      <View className="mx-4 mb-4">
        <TouchableOpacity
          onPress={onToggle}
          className="bg-purple-100 rounded-lg px-4 py-3 flex-row items-center justify-center"
        >
          <Ionicons name="time-outline" size={20} color="#9333ea" />
          <Text className="text-purple-700 font-semibold ml-2">
            Show Time Scrubber
          </Text>
        </TouchableOpacity>
      </View>
    ) : null;
  }

  return (
    <View className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-gray-200">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={20} color="#9333ea" />
          <Text className="text-base font-semibold text-gray-900 ml-2">
            Time Offset
          </Text>
        </View>

        <View className="flex-row items-center">
          {/* Reset Button */}
          {offsetMinutes !== 0 && (
            <TouchableOpacity
              onPress={handleReset}
              className="bg-gray-100 rounded-lg px-3 py-1.5 mr-2"
            >
              <Text className="text-sm font-medium text-gray-700">Reset</Text>
            </TouchableOpacity>
          )}

          {/* Close Button */}
          {onToggle && (
            <TouchableOpacity onPress={onToggle} className="p-1">
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Current Offset Display */}
      <View className="items-center mb-2">
        <Text className="text-3xl font-bold text-purple-600">
          {formatTimeOffset(offsetMinutes)}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          {offsetMinutes === 0
            ? "Current time"
            : offsetMinutes > 0
            ? "Future"
            : "Past"}
        </Text>
      </View>

      {/* Slider */}
      <View className="px-2">
        <Slider
          minimumValue={minMinutes}
          maximumValue={maxMinutes}
          value={offsetMinutes}
          onValueChange={onOffsetChange}
          step={step}
          minimumTrackTintColor="#9333ea"
          maximumTrackTintColor="#e5e7eb"
          thumbTintColor="#9333ea"
        />

        {/* Range Labels */}
        <View className="flex-row justify-between mt-1">
          <Text className="text-xs text-gray-500">-12h</Text>
          <Text className="text-xs text-gray-500">Now</Text>
          <Text className="text-xs text-gray-500">+12h</Text>
        </View>
      </View>

      {/* Helper Text */}
      <Text className="text-xs text-gray-500 text-center mt-3">
        Scrub to see times in the past or future
      </Text>
    </View>
  );
}
