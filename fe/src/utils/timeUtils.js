import { DateTime } from 'luxon';

/**
 * Get time in a timezone with offset applied
 * @param {string} timezoneId - IANA timezone identifier
 * @param {number} offsetMinutes - Minutes to offset (can be negative)
 * @returns {DateTime} Luxon DateTime object
 */
export function getOffsetTime(timezoneId, offsetMinutes = 0) {
  return DateTime.now()
    .setZone(timezoneId)
    .plus({ minutes: offsetMinutes });
}

/**
 * Determine day/night state based on hour
 * @param {DateTime} dt - Luxon DateTime object
 * @returns {string} "daytime" | "evening" | "night"
 */
export function getDayNightState(dt) {
  const hour = dt.hour;

  if (hour >= 6 && hour < 18) {
    return 'daytime';
  } else if (hour >= 18 && hour < 23) {
    return 'evening';
  } else {
    return 'night';
  }
}

/**
 * Get display info for day/night state
 * @param {string} state - "daytime" | "evening" | "night"
 * @returns {object} {icon, label, className}
 */
export function getDayNightDisplay(state) {
  const displays = {
    daytime: {
      icon: '☀️',
      label: 'Daytime',
      className: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 border border-amber-200'
    },
    evening: {
      icon: '🌅',
      label: 'Evening',
      className: 'bg-gradient-to-r from-orange-50 to-pink-50 text-orange-600 border border-orange-200'
    },
    night: {
      icon: '🌙',
      label: 'Night',
      className: 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-200'
    }
  };

  return displays[state];
}

/**
 * Format time for display
 * @param {DateTime} dt - Luxon DateTime object
 * @returns {string} Formatted time (e.g., "3:45 PM")
 */
export function formatTime(dt) {
  return dt.toFormat('h:mm a');
}

/**
 * Smart date formatting with relative labels
 * @param {DateTime} friendTime - Friend's current time
 * @param {DateTime} userTime - User's current time (with offset)
 * @returns {string} Smart formatted date
 */
export function formatSmartDate(friendTime, userTime) {
  const diffInDays = friendTime.startOf('day').diff(userTime.startOf('day'), 'days').days;

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Tomorrow';
  } else if (diffInDays === -1) {
    return 'Yesterday';
  } else {
    // Full date format for dates beyond 24h
    return friendTime.toFormat('EEE, MMM d');
  }
}

/**
 * Format time offset for display
 * @param {number} offsetMinutes - Offset in minutes
 * @returns {string} Formatted offset (e.g., "+2h 30m", "Now", "-1h")
 */
export function formatTimeOffset(offsetMinutes) {
  if (offsetMinutes === 0) {
    return 'Now';
  }

  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes > 0 ? '+' : '-';

  if (minutes === 0) {
    return `${sign}${hours}h`;
  }
  return `${sign}${hours}h ${minutes}m`;
}
