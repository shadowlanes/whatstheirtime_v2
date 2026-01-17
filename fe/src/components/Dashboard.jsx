import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Plus, Users, Globe } from "lucide-react";
import { FriendCard } from "./FriendCard";
import { FriendModal } from "./FriendModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { TimeScrubber } from "./TimeScrubber";
import { refreshWeatherForCity } from "@/utils/weatherUtils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function Dashboard({ user, onSignOut }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingFriend, setDeletingFriend] = useState(null);

  // Ticker state for updating times
  const [, setTick] = useState(0);

  // Time offset state for scrubber
  const [timeOffsetMinutes, setTimeOffsetMinutes] = useState(0);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch friends
  const fetchFriends = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/friends`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch friends");
      const data = await response.json();
      setFriends(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Reset time offset to "Now" on mount
  useEffect(() => {
    setTimeOffsetMinutes(0);
  }, []);

  // Ticker to update times every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Refresh weather for all friends every 6 hours
  useEffect(() => {
    const refreshAllWeather = async () => {
      friends.forEach((friend) => {
        refreshWeatherForCity(friend.city).catch((err) =>
          console.error(`Error refreshing weather for ${friend.city}:`, err)
        );
      });
    };

    // Refresh immediately on mount
    refreshAllWeather();

    // Set up interval for 6 hours (21,600,000 ms)
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const interval = setInterval(refreshAllWeather, SIX_HOURS);

    return () => clearInterval(interval);
  }, [friends]);

  // Create friend
  const handleCreateFriend = async (friendData) => {
    try {
      const response = await fetch(`${API_URL}/api/friends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(friendData),
      });
      if (!response.ok) throw new Error("Failed to create friend");
      const newFriend = await response.json();
      setFriends((prev) => [...prev, newFriend]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Update friend
  const handleUpdateFriend = async (friendData) => {
    try {
      const response = await fetch(`${API_URL}/api/friends/${friendData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(friendData),
      });
      if (!response.ok) throw new Error("Failed to update friend");
      const updatedFriend = await response.json();
      setFriends((prev) =>
        prev.map((f) => (f.id === updatedFriend.id ? updatedFriend : f))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete friend
  const handleDeleteFriend = async (friend) => {
    try {
      const response = await fetch(`${API_URL}/api/friends/${friend.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete friend");
      setFriends((prev) => prev.filter((f) => f.id !== friend.id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle save from modal (create or update)
  const handleSaveFriend = (friendData) => {
    if (friendData.id) {
      handleUpdateFriend(friendData);
    } else {
      handleCreateFriend(friendData);
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = friends.findIndex((f) => f.id === active.id);
      const newIndex = friends.findIndex((f) => f.id === over.id);

      const newFriends = arrayMove(friends, oldIndex, newIndex);
      setFriends(newFriends);

      // Persist new order
      const updates = newFriends.map((friend, index) => ({
        id: friend.id,
        order_index: index,
      }));

      try {
        await fetch(`${API_URL}/api/friends/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updates),
        });
      } catch (err) {
        // Revert on error
        fetchFriends();
        setError("Failed to save new order");
      }
    }
  };

  // Open edit modal
  const handleEdit = (friend) => {
    setEditingFriend(friend);
    setFriendModalOpen(true);
  };

  // Open delete modal
  const handleDelete = (friend) => {
    setDeletingFriend(friend);
    setDeleteModalOpen(true);
  };

  // Open add modal
  const handleAdd = () => {
    setEditingFriend(null);
    setFriendModalOpen(true);
  };

  // Calculate stats
  const uniqueTimezones = new Set(friends.map((f) => f.timezone_id)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-extrabold gradient-text">
            what's their time
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                />
              )}
              <span className="text-sm font-medium text-foreground">
                {user.name}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-border">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">
                {friends.length}
              </span>
              <span className="text-muted-foreground font-medium">Friends</span>
            </div>
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-border">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Globe className="h-4 w-4 text-secondary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">
                {uniqueTimezones}
              </span>
              <span className="text-muted-foreground font-medium">
                Timezones
              </span>
            </div>
          </div>
          <Button
            onClick={handleAdd}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Friend
          </Button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-medium">
            {error}
          </div>
        )}

        {/* Time Scrubber */}
        <TimeScrubber
          timeOffsetMinutes={timeOffsetMinutes}
          onOffsetChange={setTimeOffsetMinutes}
        />

        {/* Friend List */}
        {friends.length === 0 ? (
          <div className="text-center py-20 bg-card/60 backdrop-blur-sm border-2 border-dashed border-border rounded-2xl">
            <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No friends yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first friend to start tracking their time!
            </p>
            <Button
              onClick={handleAdd}
              className="gap-2 bg-primary hover:bg-primary/90 shadow-lg font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add Friend
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={friends.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {friends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    timeOffsetMinutes={timeOffsetMinutes}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Modals */}
      <FriendModal
        open={friendModalOpen}
        onOpenChange={setFriendModalOpen}
        friend={editingFriend}
        onSave={handleSaveFriend}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        friend={deletingFriend}
        onConfirm={handleDeleteFriend}
      />
    </div>
  );
}
