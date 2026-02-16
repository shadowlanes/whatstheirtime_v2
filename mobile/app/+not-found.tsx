import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        404: Page Not Found
      </Text>
      <Link href="/(tabs)" className="text-purple-600">
        Go to Dashboard
      </Link>
    </View>
  );
}
