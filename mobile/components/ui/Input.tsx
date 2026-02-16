import React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      )}
      <TextInput
        className={`border ${error ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-3 text-base text-gray-900`}
        placeholderTextColor="#9ca3af"
        style={style}
        {...props}
      />
      {error && <Text className="text-sm text-red-600 mt-1">{error}</Text>}
    </View>
  );
}
