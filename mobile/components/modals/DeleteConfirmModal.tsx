import React from "react";
import { View, Text } from "react-native";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  friendName: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  friendName,
  isLoading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Friend">
      <View>
        <Text className="text-base text-gray-700 mb-6">
          Are you sure you want to delete{" "}
          <Text className="font-semibold">{friendName}</Text>? This action cannot be
          undone.
        </Text>

        <View className="flex-row space-x-3">
          <View className="flex-1 mr-2">
            <Button variant="outline" onPress={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </View>
          <View className="flex-1 ml-2">
            <Button
              variant="destructive"
              onPress={onConfirm}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
