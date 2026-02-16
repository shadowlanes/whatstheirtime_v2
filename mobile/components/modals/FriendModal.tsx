import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { City, Friend, CreateFriendInput, UpdateFriendInput } from "@/shared/types";
import citiesData from "@/shared/data/cities.json";

const cities: City[] = citiesData as City[];

interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateFriendInput | UpdateFriendInput) => Promise<void>;
  friend?: Friend;
  isLoading?: boolean;
}

export function FriendModal({
  isOpen,
  onClose,
  onSave,
  friend,
  isLoading = false,
}: FriendModalProps) {
  const [name, setName] = useState(friend?.name || "");
  const [citySearch, setCitySearch] = useState(
    friend ? `${friend.city}, ${friend.country}` : ""
  );
  const [selectedCity, setSelectedCity] = useState<City | null>(
    friend
      ? {
          city: friend.city,
          country: friend.country,
          timezone: friend.timezone,
          lat: friend.lat,
          lng: friend.lng,
        }
      : null
  );
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [nameError, setNameError] = useState("");
  const [cityError, setCityError] = useState("");

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch || citySearch.length < 2) return [];

    const searchLower = citySearch.toLowerCase();
    return cities
      .filter(
        (city) =>
          city.city.toLowerCase().includes(searchLower) ||
          city.country.toLowerCase().includes(searchLower)
      )
      .slice(0, 10); // Limit to 10 results
  }, [citySearch]);

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setCitySearch(`${city.city}, ${city.country}`);
    setShowCitySuggestions(false);
    setCityError("");
  };

  const handleSave = async () => {
    // Validation
    let hasError = false;

    if (!name.trim()) {
      setNameError("Name is required");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!selectedCity) {
      setCityError("Please select a city");
      hasError = true;
    } else {
      setCityError("");
    }

    if (hasError) return;

    // Prepare data
    const data: CreateFriendInput | UpdateFriendInput = {
      name: name.trim(),
      city: selectedCity!.city,
      country: selectedCity!.country,
      timezone: selectedCity!.timezone,
      lat: selectedCity!.lat,
      lng: selectedCity!.lng,
    };

    await onSave(data);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setCitySearch("");
    setSelectedCity(null);
    setShowCitySuggestions(false);
    setNameError("");
    setCityError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={friend ? "Edit Friend" : "Add Friend"}
    >
      <View>
        {/* Name Input */}
        <Input
          label="Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setNameError("");
          }}
          placeholder="Enter friend's name"
          error={nameError}
        />

        {/* City Search */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">City</Text>
          <View className="relative">
            <TextInput
              className={`border ${cityError ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-3 text-base text-gray-900`}
              value={citySearch}
              onChangeText={(text) => {
                setCitySearch(text);
                setShowCitySuggestions(true);
                if (text !== `${selectedCity?.city}, ${selectedCity?.country}`) {
                  setSelectedCity(null);
                }
                setCityError("");
              }}
              placeholder="Search for a city"
              placeholderTextColor="#9ca3af"
            />
            {citySearch && (
              <TouchableOpacity
                onPress={() => {
                  setCitySearch("");
                  setSelectedCity(null);
                  setShowCitySuggestions(false);
                }}
                className="absolute right-3 top-3"
              >
                <Ionicons name="close-circle" size={24} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
          {cityError && <Text className="text-sm text-red-600 mt-1">{cityError}</Text>}

          {/* City Suggestions */}
          {showCitySuggestions && filteredCities.length > 0 && (
            <View className="border border-gray-300 rounded-lg mt-2 max-h-60">
              <FlatList
                data={filteredCities}
                keyExtractor={(item, index) => `${item.city}-${item.country}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectCity(item)}
                    className="px-4 py-3 border-b border-gray-200"
                  >
                    <Text className="text-base text-gray-900">
                      {item.city}, {item.country}
                    </Text>
                    <Text className="text-sm text-gray-500">{item.timezone}</Text>
                  </TouchableOpacity>
                )}
                nestedScrollEnabled
              />
            </View>
          )}
        </View>

        {/* Selected City Display */}
        {selectedCity && (
          <View className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <View className="flex-row items-center">
              <Ionicons name="location" size={20} color="#9333ea" />
              <View className="ml-2 flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {selectedCity.city}, {selectedCity.country}
                </Text>
                <Text className="text-sm text-gray-600">{selectedCity.timezone}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            </View>
          </View>
        )}

        {/* Save Button */}
        <Button onPress={handleSave} isLoading={isLoading}>
          {friend ? "Update Friend" : "Add Friend"}
        </Button>
      </View>
    </Modal>
  );
}
