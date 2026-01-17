import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Ruler, RotateCcw } from "lucide-react";
import { DateTime } from "luxon";
import "flag-icons/css/flag-icons.min.css";
import { getOffsetTime, formatTime, getDayNightState, getDayNightDisplay, formatTimeOffset } from "@/utils/timeUtils";
import { getWeatherForCity } from "@/utils/weatherUtils";

function getCountryFlagClass(countryCode) {
  return `fi fi-${countryCode.toLowerCase()}`;
}

export function YouCard({
  userLocation,
  timeOffsetMinutes = 0,
  onTimeOffsetChange,
  onEdit,
  onToggleScrubber,
  isScrubberVisible
}) {
  const [weather, setWeather] = useState(null);
  const [userTime, setUserTime] = useState(DateTime.now());

  useEffect(() => {
    if (userLocation?.city) {
      getWeatherForCity(userLocation.city).then(setWeather);
    }
  }, [userLocation?.city]);

  // Update user time every minute for scrubber
  useEffect(() => {
    const interval = setInterval(() => {
      setUserTime(DateTime.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Empty state when no location set
  if (!userLocation || !userLocation.city) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-card/40 p-6 text-center mb-6">
        <h3 className="font-bold text-lg mb-2">Set Your Location</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add your city to see your time, weather, and air quality
        </p>
        <Button onClick={onEdit} className="gap-2">
          <Pencil className="h-4 w-4" />
          Set Location
        </Button>
      </div>
    );
  }

  const localTime = getOffsetTime(userLocation.timezone_id, timeOffsetMinutes);
  const dayNightState = getDayNightState(localTime);
  const dayNightDisplay = getDayNightDisplay(dayNightState);

  // Scrubber handlers
  const offsetTime = userTime.plus({ minutes: timeOffsetMinutes });
  const isOffset = timeOffsetMinutes !== 0;
  const sliderValue = timeOffsetMinutes / 60;

  const handleSliderChange = (e) => {
    const hours = parseFloat(e.target.value);
    onTimeOffsetChange(hours * 60);
  };

  const handleReset = () => {
    onTimeOffsetChange(0);
    onToggleScrubber(); // Hide scrubber when reset
  };

  return (
    <div className="mb-6">
      <div className="relative rounded-2xl border-2 shadow-md ring-2 ring-primary/10 bg-white transition-all border-border">
        <div className="p-4 sm:p-5">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shadow-inner flex-shrink-0">
              <span className={`${getCountryFlagClass(userLocation.country_code)} text-xl`} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-foreground truncate leading-tight">You</h3>
              <p className="text-xs text-muted-foreground font-medium truncate">{userLocation.city}</p>
            </div>

            {/* Time + Weather/AQI */}
            <div className="text-right">
              <p className="text-2xl font-extrabold tabular-nums gradient-text leading-tight">{formatTime(localTime)}</p>
              {weather && timeOffsetMinutes === 0 ? (
                <div className="flex flex-col gap-0.5 mt-1 items-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{dayNightDisplay.icon}</span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {weather.temperature}°C
                    </span>
                  </div>
                  {weather.airQuality?.aqi && (
                    <span className={`text-xs font-medium ${weather.airQuality.color}`}>
                      AQI {weather.airQuality.aqi}
                    </span>
                  )}
                </div>
              ) : (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${dayNightDisplay.className} mt-1`}>
                  <span className="text-sm">{dayNightDisplay.icon}</span>
                </span>
              )}
            </div>

            {/* Actions: Edit + Ruler */}
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-7 w-7 rounded-lg text-primary hover:text-primary hover:bg-accent"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleScrubber}
                className={`h-7 w-7 rounded-lg hover:bg-accent ${isScrubberVisible ? 'bg-accent text-primary' : 'text-muted-foreground'}`}
              >
                <Ruler className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4">
            {/* Flag */}
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shadow-inner">
              <span className={`${getCountryFlagClass(userLocation.country_code)} text-2xl`} />
            </div>

            {/* Name/Location */}
            <div className="min-w-0 pr-4">
              <h3 className="font-bold text-lg text-foreground truncate">You</h3>
              <p className="text-sm text-muted-foreground font-medium truncate">{userLocation.city}</p>
            </div>

            {/* Weather & Air Quality */}
            <div className="flex flex-col items-end w-28 gap-0.5">
              {weather && timeOffsetMinutes === 0 && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{dayNightDisplay.icon}</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-base leading-tight whitespace-nowrap">{weather.temperature}°C</span>
                  </div>
                  {weather.airQuality?.aqi && (
                    <span className={`text-xs leading-tight font-medium ${weather.airQuality.color}`}>
                      AQI: {weather.airQuality.label}: {weather.airQuality.aqi}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Time + Status */}
            <div className="text-right w-44">
              <p className="text-3xl font-extrabold tabular-nums gradient-text">{formatTime(localTime)}</p>
              {(!weather || timeOffsetMinutes !== 0) && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${dayNightDisplay.className}`}>
                  <span>{dayNightDisplay.icon}</span>
                  {dayNightDisplay.label}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-9 w-9 rounded-xl text-primary hover:text-primary hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleScrubber}
                className={`h-9 w-9 rounded-xl hover:bg-accent ${isScrubberVisible ? 'bg-accent text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                <Ruler className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Time Scrubber - appears when ruler icon is clicked */}
        {isScrubberVisible && (
          <div className="border-t border-border p-4 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs font-medium text-muted-foreground w-8 sm:w-12 text-center">
                -12h
              </span>

              <div className="flex-1 relative">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.25"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  aria-label="Time offset in hours"
                  aria-valuetext={formatTimeOffset(timeOffsetMinutes)}
                  className="w-full h-3 sm:h-2 bg-muted rounded-lg appearance-none cursor-pointer slider-thumb touch-action-none"
                />
                <div className="absolute top-0 left-1/2 w-px h-3 sm:h-2 bg-primary -translate-x-1/2 pointer-events-none" />
              </div>

              <span className="text-xs font-medium text-muted-foreground w-8 sm:w-12 text-center">
                +12h
              </span>
            </div>

            {isOffset && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                  {formatTimeOffset(timeOffsetMinutes)}
                </span>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  aria-label="Reset to now"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
