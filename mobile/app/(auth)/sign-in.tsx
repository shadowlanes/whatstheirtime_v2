import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn();

      if (!result.success) {
        Alert.alert(
          "Sign In Failed",
          result.error || "An error occurred during sign in",
          [{ text: "OK" }]
        );
      }
      // If successful, navigation will happen automatically via useAuth
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred", [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} className="bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* App Logo/Icon */}
        <View className="mb-8">
          <Ionicons name="time-outline" size={80} color="#9333ea" />
        </View>

        {/* App Title */}
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          What's Their Time
        </Text>
        <Text className="text-base text-gray-600 text-center mb-12 px-4">
          Track your friends' times across timezones with weather and air quality
        </Text>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleSignIn}
          disabled={isLoading}
          className="bg-purple-600 rounded-lg px-8 py-4 flex-row items-center justify-center w-full max-w-sm"
          style={styles.button}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color="#ffffff" />
              <Text className="text-white text-lg font-semibold ml-3">
                Sign in with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Privacy Note */}
        <Text className="text-xs text-gray-500 text-center mt-8 px-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    shadowColor: "#9333ea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
