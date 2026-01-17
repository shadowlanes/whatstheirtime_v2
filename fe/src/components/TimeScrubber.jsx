import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { formatTimeOffset } from '@/utils/timeUtils';

export function TimeScrubber({ timeOffsetMinutes, onOffsetChange }) {
  const [userTime, setUserTime] = useState(DateTime.now());

  // Update user time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setUserTime(DateTime.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const offsetTime = userTime.plus({ minutes: timeOffsetMinutes });
  const isOffset = timeOffsetMinutes !== 0;

  // Calculate slider value (convert minutes to hours for slider)
  const sliderValue = timeOffsetMinutes / 60;

  const handleSliderChange = (e) => {
    const hours = parseFloat(e.target.value);
    onOffsetChange(hours * 60); // Convert back to minutes
  };

  const handleReset = () => {
    onOffsetChange(0);
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border p-4 sm:p-6 mb-6">
      {/* Mobile: Compact header with time and date on same line */}
      <div className="sm:hidden flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Your Time</p>
          <p className="text-xl font-bold gradient-text">
            {offsetTime.toFormat('h:mm a')}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {offsetTime.toFormat('EEE, MMM d')}
        </p>
      </div>

      {/* Desktop: Original centered layout */}
      <div className="hidden sm:flex items-center justify-between mb-4">
        <div className="flex-1 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Your Time</p>
          <p className="text-2xl font-bold gradient-text">
            {offsetTime.toFormat('h:mm a')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {offsetTime.toFormat('EEE, MMM d')}
          </p>
        </div>
      </div>

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
  );
}
