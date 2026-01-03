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
 * Determine day/night state based on hour with granular phases
 * @param {DateTime} dt - Luxon DateTime object
 * @returns {string} One of the time-of-day phases
 */
export function getDayNightState(dt) {
  const hour = dt.hour;

  // Deep night (midnight to pre-dawn): 0-4
  if (hour >= 0 && hour < 4) {
    return 'deep-night';
  }
  // Dawn (early morning transition): 4-6
  else if (hour >= 4 && hour < 6) {
    return 'dawn';
  }
  // Morning (bright early day): 6-10
  else if (hour >= 6 && hour < 10) {
    return 'morning';
  }
  // Midday (peak brightness): 10-15
  else if (hour >= 10 && hour < 15) {
    return 'midday';
  }
  // Afternoon (still bright but softening): 15-18
  else if (hour >= 15 && hour < 18) {
    return 'afternoon';
  }
  // Sunset (golden hour): 18-20
  else if (hour >= 18 && hour < 20) {
    return 'sunset';
  }
  // Dusk (twilight): 20-22
  else if (hour >= 20 && hour < 22) {
    return 'dusk';
  }
  // Evening (early night): 22-24
  else {
    return 'evening';
  }
}

/**
 * Get display info for day/night state
 * @param {string} state - One of the time-of-day phases
 * @returns {object} {icon, label, className, cardGradient, borderColor}
 */
export function getDayNightDisplay(state) {
  const displays = {
    'deep-night': {
      icon: '🌙',
      label: 'Deep Night',
      className: 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200',
      cardGradient: 'bg-gradient-to-br from-indigo-100/60 via-purple-100/40 to-slate-100/50',
      borderColor: 'border-indigo-200'
    },
    'dawn': {
      icon: '🌅',
      label: 'Dawn',
      className: 'bg-gradient-to-r from-rose-50 to-orange-50 text-rose-600 border border-rose-200',
      cardGradient: 'bg-gradient-to-br from-rose-50/50 via-orange-50/40 to-amber-50/30',
      borderColor: 'border-rose-200'
    },
    'morning': {
      icon: '🌤️',
      label: 'Morning',
      className: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 border border-amber-200',
      cardGradient: 'bg-gradient-to-br from-amber-50/50 via-yellow-50/40 to-orange-50/30',
      borderColor: 'border-amber-200'
    },
    'midday': {
      icon: '☀️',
      label: 'Midday',
      className: 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-600 border border-yellow-200',
      cardGradient: 'bg-gradient-to-br from-yellow-50/60 via-amber-50/40 to-white',
      borderColor: 'border-yellow-200'
    },
    'afternoon': {
      icon: '🌞',
      label: 'Afternoon',
      className: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 border border-orange-200',
      cardGradient: 'bg-gradient-to-br from-orange-50/50 via-amber-50/40 to-yellow-50/30',
      borderColor: 'border-orange-200'
    },
    'sunset': {
      icon: '🌇',
      label: 'Sunset',
      className: 'bg-gradient-to-r from-orange-50 to-pink-50 text-orange-600 border border-orange-200',
      cardGradient: 'bg-gradient-to-br from-orange-50/60 via-pink-50/50 to-purple-50/30',
      borderColor: 'border-orange-200'
    },
    'dusk': {
      icon: '🌆',
      label: 'Dusk',
      className: 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-600 border border-purple-200',
      cardGradient: 'bg-gradient-to-br from-purple-50/50 via-indigo-50/40 to-blue-50/30',
      borderColor: 'border-purple-200'
    },
    'evening': {
      icon: '🌃',
      label: 'Evening',
      className: 'bg-gradient-to-r from-indigo-50 to-slate-50 text-indigo-600 border border-indigo-200',
      cardGradient: 'bg-gradient-to-br from-indigo-50/60 via-slate-100/40 to-purple-50/30',
      borderColor: 'border-indigo-200'
    }
  };

  return displays[state] || displays['midday'];
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
