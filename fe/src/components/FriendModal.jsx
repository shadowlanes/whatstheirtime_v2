import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import cities from "@/data/cities.json";

export function FriendModal({ open, onOpenChange, friend, onSave }) {
  const [name, setName] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isEditing = !!friend;

  // Sync state when modal opens or friend changes
  useEffect(() => {
    if (open) {
      setName(friend?.name || "");
      setCitySearch(friend?.city || "");
      setSelectedCity(
        friend
          ? {
              name: friend.city,
              country_code: friend.country_code,
              timezone_id: friend.timezone_id,
            }
          : null
      );
    }
  }, [open, friend]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch || citySearch.length < 2) return [];
    const search = citySearch.toLowerCase();
    return cities
      .filter((city) => city.name.toLowerCase().includes(search))
      .slice(0, 10);
  }, [citySearch]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setCitySearch(city.name);
    setShowSuggestions(false);
  };

  const handleSave = () => {
    if (!name.trim() || !selectedCity) return;

    onSave({
      id: friend?.id,
      name: name.trim(),
      city: selectedCity.name,
      timezone_id: selectedCity.timezone_id,
      country_code: selectedCity.country_code,
    });

    // Reset form
    setName("");
    setCitySearch("");
    setSelectedCity(null);
    onOpenChange(false);
  };

  const handleOpenChange = (open) => {
    if (!open) {
      // Reset form when closing
      setName(friend?.name || "");
      setCitySearch(friend?.city || "");
      setSelectedCity(
        friend
          ? {
              name: friend.city,
              country_code: friend.country_code,
              timezone_id: friend.timezone_id,
            }
          : null
      );
    }
    onOpenChange(open);
  };

  const isValid = name.trim() && selectedCity;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Friend" : "Add Friend"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter friend's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2 relative">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Search for a city..."
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setSelectedCity(null);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />

            {/* City suggestions dropdown */}
            {showSuggestions && filteredCities.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                {filteredCities.map((city, index) => (
                  <button
                    key={`${city.name}-${city.country_code}-${index}`}
                    className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                    onMouseDown={() => handleCitySelect(city)}
                  >
                    <span
                      className={`fi fi-${city.country_code.toLowerCase()} text-sm`}
                    />
                    <span>{city.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {city.country_code}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedCity && (
              <p className="text-xs text-muted-foreground">
                Timezone: {selectedCity.timezone_id}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {isEditing ? "Save Changes" : "Add Friend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
