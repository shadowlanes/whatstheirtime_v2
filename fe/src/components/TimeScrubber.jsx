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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-purple-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
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

      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-muted-foreground w-12 text-center">
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
            className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="absolute top-0 left-1/2 w-px h-2 bg-purple-400 -translate-x-1/2" />
        </div>

        <span className="text-xs font-medium text-muted-foreground w-12 text-center">
          +12h
        </span>

        {isOffset && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 rounded-xl border-purple-200 hover:bg-purple-50"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to Now
          </Button>
        )}
      </div>

      {isOffset && (
        <div className="text-center mt-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            {formatTimeOffset(timeOffsetMinutes)}
          </span>
        </div>
      )}
    </div>
  );
}
