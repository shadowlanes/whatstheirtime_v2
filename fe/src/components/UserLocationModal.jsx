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

export function UserLocationModal({ open, onOpenChange, currentLocation, onSave }) {
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync state when modal opens or location changes
  useEffect(() => {
    if (open) {
      setCitySearch(currentLocation?.city || "");
      setSelectedCity(
        currentLocation?.city
          ? {
              name: currentLocation.city,
              country_code: currentLocation.country_code,
              timezone_id: currentLocation.timezone_id,
            }
          : null
      );
    }
  }, [open, currentLocation]);

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
    if (!selectedCity) return;

    onSave({
      city: selectedCity.name,
      timezone_id: selectedCity.timezone_id,
      country_code: selectedCity.country_code,
    });

    setCitySearch("");
    setSelectedCity(null);
    onOpenChange(false);
  };

  const handleClearLocation = () => {
    onSave({ city: null, timezone_id: null, country_code: null });
    setCitySearch("");
    setSelectedCity(null);
    onOpenChange(false);
  };

  const handleOpenChange = (open) => {
    if (!open) {
      // Reset form when closing
      setCitySearch(currentLocation?.city || "");
      setSelectedCity(
        currentLocation?.city
          ? {
              name: currentLocation.city,
              country_code: currentLocation.country_code,
              timezone_id: currentLocation.timezone_id,
            }
          : null
      );
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Your Location</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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
              className="rounded-xl"
            />

            {/* City suggestions dropdown */}
            {showSuggestions && filteredCities.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
                {filteredCities.map((city, index) => (
                  <button
                    key={`${city.name}-${city.country_code}-${index}`}
                    className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 first:rounded-t-xl last:rounded-b-xl"
                    onMouseDown={() => handleCitySelect(city)}
                  >
                    <span
                      className={`fi fi-${city.country_code.toLowerCase()} text-lg`}
                    />
                    <span className="font-medium">{city.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">
                      {city.country_code}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedCity && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                  {selectedCity.timezone_id}
                </span>
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {currentLocation?.city && (
            <Button variant="outline" onClick={handleClearLocation} className="rounded-xl">
              Clear Location
            </Button>
          )}
          <Button onClick={handleSave} disabled={!selectedCity} className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
