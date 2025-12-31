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
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-purple-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{isEditing ? "Edit Friend" : "Add Friend"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="font-semibold">Name</Label>
            <Input
              id="name"
              placeholder="Enter friend's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200"
            />
          </div>

          <div className="grid gap-2 relative">
            <Label htmlFor="city" className="font-semibold">City</Label>
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
              className="rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200"
            />

            {/* City suggestions dropdown */}
            {showSuggestions && filteredCities.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-purple-100 rounded-xl shadow-lg shadow-purple-100 z-50 max-h-60 overflow-auto">
                {filteredCities.map((city, index) => (
                  <button
                    key={`${city.name}-${city.country_code}-${index}`}
                    className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-3 first:rounded-t-xl last:rounded-b-xl"
                    onMouseDown={() => handleCitySelect(city)}
                  >
                    <span
                      className={`fi fi-${city.country_code.toLowerCase()} text-lg`}
                    />
                    <span className="font-medium">{city.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto bg-slate-100 px-2 py-0.5 rounded-full">
                      {city.country_code}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedCity && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                  {selectedCity.timezone_id}
                </span>
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-xl border-purple-200 hover:bg-purple-50">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid} className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-200">
            {isEditing ? "Save Changes" : "Add Friend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
