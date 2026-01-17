import { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";
import { getOffsetTime, formatTime, getDayNightState, getDayNightDisplay } from "@/utils/timeUtils";
import { getWeatherForCity } from "@/utils/weatherUtils";

function getCountryFlagClass(countryCode) {
  return `fi fi-${countryCode.toLowerCase()}`;
}

export function FriendCard({ friend, timeOffsetMinutes = 0, onEdit, onDelete }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    getWeatherForCity(friend.city).then((data) => {
      setWeather(data);
    });
  }, [friend.city]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: friend.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const localTime = getOffsetTime(friend.timezone_id, timeOffsetMinutes);
  const dayNightState = getDayNightState(localTime);
  const dayNightDisplay = getDayNightDisplay(dayNightState);

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`relative rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${dayNightDisplay.cardGradient} ${dayNightDisplay.borderColor} ${isDragging ? "shadow-xl ring-2 ring-primary/40" : ""}`}>
        <div className="p-4 sm:p-5">
          {/* Mobile Layout - Optimized */}
          <div className="flex sm:hidden items-center gap-3">
            {/* Left: Drag handle + Flag + Name/City */}
            <button
              className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/30 hover:text-primary transition-colors flex-shrink-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shadow-inner flex-shrink-0">
              <span className={`${getCountryFlagClass(friend.country_code)} text-xl`} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-foreground truncate leading-tight">{friend.name}</h3>
              <p className="text-xs text-muted-foreground font-medium truncate">{friend.city}</p>
            </div>

            {/* Right: Time (hero) + Weather/AQI underneath */}
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
                  {weather.airQuality && weather.airQuality.aqi && (
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

            {/* Actions */}
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(friend)}
                className="h-7 w-7 rounded-lg text-primary hover:text-primary hover:bg-accent"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(friend)}
                className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout - Grid based for perfect alignment */}
          <div className="hidden sm:grid grid-cols-[auto_auto_1fr_auto_auto_auto] items-center gap-4">
            {/* Drag handle */}
            <button
              className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/30 hover:text-primary transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            {/* Flag */}
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shadow-inner">
              <span className={`${getCountryFlagClass(friend.country_code)} text-2xl`} />
            </div>

            {/* Name/Location - flexible to fill space */}
            <div className="min-w-0 pr-4">
              <h3 className="font-bold text-lg text-foreground truncate">{friend.name}</h3>
              <p className="text-sm text-muted-foreground font-medium truncate">{friend.city}</p>
            </div>

            {/* Weather & Air Quality - fixed width for alignment, only show when at current time */}
            <div className="flex flex-col items-end w-28 gap-0.5">
              {weather && timeOffsetMinutes === 0 && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{dayNightDisplay.icon}</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-base leading-tight whitespace-nowrap">{weather.temperature}°C</span>
                  </div>
                  {weather.airQuality && weather.airQuality.aqi && (
                    <span className={`text-xs leading-tight font-medium ${weather.airQuality.color}`}>
                      AQI: {weather.airQuality.label}: {weather.airQuality.aqi}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Time + Status - fixed width for alignment */}
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
                onClick={() => onEdit(friend)}
                className="h-9 w-9 rounded-xl text-primary hover:text-primary hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(friend)}
                className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
