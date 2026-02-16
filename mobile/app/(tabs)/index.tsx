import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Ionicons } from "@expo/vector-icons";
import { useFriends } from "@/hooks/useFriends";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useMultipleWeather } from "@/hooks/useWeather";
import { YouCard } from "@/components/cards/YouCard";
import { FriendCard } from "@/components/cards/FriendCard";
import { TimeScrubber } from "@/components/TimeScrubber";
import { FriendModal } from "@/components/modals/FriendModal";
import { UserLocationModal } from "@/components/modals/UserLocationModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import type { Friend, CreateFriendInput, UpdateFriendInput, SetUserLocationInput } from "@/shared/types";

export default function DashboardScreen() {
  // State
  const [offsetMinutes, setOffsetMinutes] = useState(0);
  const [showTimeScrubber, setShowTimeScrubber] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showUserLocationModal, setShowUserLocationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | undefined>();
  const [deletingFriend, setDeletingFriend] = useState<Friend | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hooks
  const {
    friends,
    isLoading: friendsLoading,
    error: friendsError,
    loadFriends,
    createFriend,
    updateFriend,
    deleteFriend,
    reorderFriends,
  } = useFriends();

  const {
    userLocation,
    isLoading: userLocationLoading,
    loadUserLocation,
    setLocation,
    deleteLocation,
  } = useUserLocation();

  // Load weather for all locations (user + friends)
  const allCities = [
    ...(userLocation ? [userLocation.city] : []),
    ...friends.map((f) => f.city),
  ];

  const { weatherMap, isLoading: weatherLoading, loadAllWeather } = useMultipleWeather(allCities);

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadFriends(), loadUserLocation(), loadAllWeather()]);
    setIsRefreshing(false);
  };

  // Friend CRUD handlers
  const handleAddFriend = () => {
    setEditingFriend(undefined);
    setShowFriendModal(true);
  };

  const handleEditFriend = (friend: Friend) => {
    setEditingFriend(friend);
    setShowFriendModal(true);
  };

  const handleSaveFriend = async (data: CreateFriendInput | UpdateFriendInput) => {
    if (editingFriend) {
      await updateFriend(editingFriend.id, data as UpdateFriendInput);
    } else {
      await createFriend(data as CreateFriendInput);
    }
    setShowFriendModal(false);
    setEditingFriend(undefined);
    // Reload weather for new city
    await loadAllWeather();
  };

  const handleDeleteFriend = (friend: Friend) => {
    setDeletingFriend(friend);
    setShowDeleteModal(true);
  };

  const confirmDeleteFriend = async () => {
    if (deletingFriend) {
      const success = await deleteFriend(deletingFriend.id);
      if (success) {
        setShowDeleteModal(false);
        setDeletingFriend(undefined);
      }
    }
  };

  // User location handlers
  const handleEditUserLocation = () => {
    setShowUserLocationModal(true);
  };

  const handleSaveUserLocation = async (data: SetUserLocationInput) => {
    await setLocation(data);
    setShowUserLocationModal(false);
    // Reload weather for new location
    await loadAllWeather();
  };

  const handleClearUserLocation = async () => {
    Alert.alert(
      "Clear Location",
      "Are you sure you want to clear your location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await deleteLocation();
            setShowUserLocationModal(false);
          },
        },
      ]
    );
  };

  // Drag and drop handler
  const handleDragEnd = ({ data }: { data: Friend[] }) => {
    reorderFriends(data);
  };

  // Render friend item
  const renderFriendItem = ({ item, drag }: RenderItemParams<Friend>) => {
    const friendWeather = weatherMap[item.city] || null;

    return (
      <ScaleDecorator>
        <FriendCard
          friend={item}
          weather={friendWeather}
          offsetMinutes={offsetMinutes}
          userTimezone={userLocation?.timezone}
          onEditPress={() => handleEditFriend(item)}
          onDeletePress={() => handleDeleteFriend(item)}
          drag={drag}
        />
      </ScaleDecorator>
    );
  };

  // Loading state
  if (friendsLoading && !friends.length && !userLocation) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333ea" />
          <Text className="text-gray-600 mt-4">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">
            What's Their Time
          </Text>
          <TouchableOpacity
            onPress={() => setShowTimeScrubber(!showTimeScrubber)}
            className="p-2"
          >
            <Ionicons
              name={showTimeScrubber ? "time" : "time-outline"}
              size={24}
              color="#9333ea"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <DraggableFlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        onDragEnd={handleDragEnd}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* YouCard */}
            <View className="mt-4">
              <YouCard
                userLocation={userLocation}
                weather={userLocation ? weatherMap[userLocation.city] : null}
                offsetMinutes={offsetMinutes}
                onEditPress={handleEditUserLocation}
              />
            </View>

            {/* Time Scrubber */}
            <TimeScrubber
              offsetMinutes={offsetMinutes}
              onOffsetChange={setOffsetMinutes}
              isVisible={showTimeScrubber}
              onToggle={() => setShowTimeScrubber(!showTimeScrubber)}
            />

            {/* Friends Header */}
            {friends.length > 0 && (
              <View className="px-4 mb-2">
                <Text className="text-lg font-semibold text-gray-900">
                  Friends ({friends.length})
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !userLocation && friends.length === 0 ? (
            <View className="px-4 mt-8">
              <Text className="text-base text-gray-600 text-center">
                No friends added yet. Tap the + button to add your first friend!
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleAddFriend}
        className="absolute bottom-6 right-6 bg-purple-600 rounded-full p-4 shadow-lg"
        style={{
          shadowColor: "#9333ea",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      {/* Modals */}
      <FriendModal
        isOpen={showFriendModal}
        onClose={() => {
          setShowFriendModal(false);
          setEditingFriend(undefined);
        }}
        onSave={handleSaveFriend}
        friend={editingFriend}
      />

      <UserLocationModal
        isOpen={showUserLocationModal}
        onClose={() => setShowUserLocationModal(false)}
        onSave={handleSaveUserLocation}
        onClear={handleClearUserLocation}
        userLocation={userLocation}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingFriend(undefined);
        }}
        onConfirm={confirmDeleteFriend}
        friendName={deletingFriend?.name || ""}
      />
    </SafeAreaView>
  );
}
