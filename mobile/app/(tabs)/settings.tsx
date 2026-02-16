import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Config } from "@/constants/Config";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* User Info Section */}
        {user && (
          <View className="bg-white mt-4 mx-4 rounded-2xl p-4 border border-gray-200">
            <Text className="text-sm font-medium text-gray-500 mb-3">
              Account
            </Text>

            {/* User Profile */}
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-purple-100 items-center justify-center">
                {user.image ? (
                  <View>
                    {/* Would use Image component here with user.image */}
                    <Ionicons name="person" size={32} color="#9333ea" />
                  </View>
                ) : (
                  <Ionicons name="person" size={32} color="#9333ea" />
                )}
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {user.name}
                </Text>
                <Text className="text-sm text-gray-600">{user.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* App Info Section */}
        <View className="bg-white mt-4 mx-4 rounded-2xl p-4 border border-gray-200">
          <Text className="text-sm font-medium text-gray-500 mb-3">
            App Information
          </Text>

          {/* App Version */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
              <Text className="text-base text-gray-900 ml-3">Version</Text>
            </View>
            <Text className="text-base text-gray-600">{Config.APP_VERSION}</Text>
          </View>

          {/* Environment */}
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Ionicons name="server-outline" size={20} color="#6b7280" />
              <Text className="text-base text-gray-900 ml-3">Environment</Text>
            </View>
            <Text className="text-base text-gray-600 capitalize">
              {Config.ENV}
            </Text>
          </View>
        </View>

        {/* Actions Section */}
        <View className="bg-white mt-4 mx-4 rounded-2xl p-4 border border-gray-200">
          <Text className="text-sm font-medium text-gray-500 mb-3">
            Actions
          </Text>

          {/* About */}
          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-200"
            onPress={() => {
              Alert.alert(
                "About",
                "What's Their Time helps you track your friends' times across timezones with real-time weather and air quality data.\n\nBuilt with React Native and Expo.",
                [{ text: "OK" }]
              );
            }}
          >
            <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
            <Text className="text-base text-gray-900 ml-3">About</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-200"
            onPress={() => {
              Alert.alert(
                "Privacy Policy",
                "Your privacy policy would be displayed here or opened in a web browser.",
                [{ text: "OK" }]
              );
            }}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="#6b7280" />
            <Text className="text-base text-gray-900 ml-3">Privacy Policy</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9ca3af"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          {/* Sign Out */}
          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text className="text-base text-red-600 ml-3 font-medium">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-8 mb-6">
          <Text className="text-center text-sm text-gray-500">
            Made with ❤️ for tracking time zones
          </Text>
          <Text className="text-center text-xs text-gray-400 mt-1">
            © 2026 What's Their Time
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
