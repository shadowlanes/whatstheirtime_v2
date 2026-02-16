import { useState, useEffect, useCallback } from "react";
import { friendsApi } from "@/lib/apiClient";
import type { Friend, CreateFriendInput, UpdateFriendInput } from "@/shared/types";

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load friends on mount
  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await friendsApi.getAll();
      // Sort by order
      const sorted = data.sort((a, b) => a.order - b.order);
      setFriends(sorted);
    } catch (err) {
      console.error("Error loading friends:", err);
      setError("Failed to load friends");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFriend = useCallback(
    async (input: CreateFriendInput): Promise<Friend | null> => {
      try {
        const newFriend = await friendsApi.create(input);
        setFriends((prev) => [...prev, newFriend].sort((a, b) => a.order - b.order));
        return newFriend;
      } catch (err) {
        console.error("Error creating friend:", err);
        setError("Failed to create friend");
        return null;
      }
    },
    []
  );

  const updateFriend = useCallback(
    async (id: string, updates: UpdateFriendInput): Promise<Friend | null> => {
      try {
        const updatedFriend = await friendsApi.update(id, updates);
        setFriends((prev) =>
          prev
            .map((f) => (f.id === id ? updatedFriend : f))
            .sort((a, b) => a.order - b.order)
        );
        return updatedFriend;
      } catch (err) {
        console.error("Error updating friend:", err);
        setError("Failed to update friend");
        return null;
      }
    },
    []
  );

  const deleteFriend = useCallback(async (id: string): Promise<boolean> => {
    try {
      await friendsApi.delete(id);
      setFriends((prev) => prev.filter((f) => f.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting friend:", err);
      setError("Failed to delete friend");
      return false;
    }
  }, []);

  const reorderFriends = useCallback(async (newOrder: Friend[]): Promise<boolean> => {
    try {
      // Optimistically update UI
      setFriends(newOrder);

      // Send reorder request to backend
      const friendIds = newOrder.map((f) => f.id);
      await friendsApi.reorder({ friendIds });

      return true;
    } catch (err) {
      console.error("Error reordering friends:", err);
      setError("Failed to reorder friends");
      // Reload friends to revert optimistic update
      await loadFriends();
      return false;
    }
  }, [loadFriends]);

  return {
    friends,
    isLoading,
    error,
    loadFriends,
    createFriend,
    updateFriend,
    deleteFriend,
    reorderFriends,
  };
}
