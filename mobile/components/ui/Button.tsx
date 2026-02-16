import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";

type ButtonVariant = "default" | "destructive" | "outline" | "ghost";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  isLoading = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const variantStyles = {
    default: "bg-purple-600",
    destructive: "bg-red-600",
    outline: "bg-transparent border border-gray-300",
    ghost: "bg-transparent",
  };

  const textVariantStyles = {
    default: "text-white",
    destructive: "text-white",
    outline: "text-gray-900",
    ghost: "text-gray-900",
  };

  const disabledStyles = disabled || isLoading ? "opacity-50" : "";

  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      className={`rounded-lg px-4 py-3 items-center justify-center ${variantStyles[variant]} ${disabledStyles}`}
      style={style}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "default" || variant === "destructive" ? "#fff" : "#000"}
        />
      ) : typeof children === "string" ? (
        <Text className={`font-semibold ${textVariantStyles[variant]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
