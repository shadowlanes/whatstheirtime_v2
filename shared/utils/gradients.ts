import type { DayNightState } from './timeUtils';

export interface GradientColors {
  colors: string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

/**
 * Get LinearGradient colors for React Native based on day/night state
 */
export function getGradientColors(state: DayNightState): GradientColors {
  const gradients: Record<DayNightState, GradientColors> = {
    'deep-night': {
      colors: ['#e0e7ff', '#f3e8ff', '#e2e8f0'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    'dawn': {
      colors: ['#fff1f2', '#ffedd5', '#fef3c7'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    'morning': {
      colors: ['#fef3c7', '#fef9c3', '#ffedd5'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    'midday': {
      colors: ['#fef9c3', '#fef3c7', '#ffffff'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    'afternoon': {
      colors: ['#ffedd5', '#fef3c7', '#fef9c3'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    'sunset': {
      colors: ['#ffedd5', '#fce7f3', '#f3e8ff'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    'dusk': {
      colors: ['#f3e8ff', '#e0e7ff', '#dbeafe'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    'evening': {
      colors: ['#e0e7ff', '#e2e8f0', '#f3e8ff'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  };

  return gradients[state];
}

/**
 * Get border color for day/night state
 */
export function getBorderColor(state: DayNightState): string {
  const borderColors: Record<DayNightState, string> = {
    'deep-night': '#c7d2fe',
    'dawn': '#fecaca',
    'morning': '#fcd34d',
    'midday': '#fde047',
    'afternoon': '#fdba74',
    'sunset': '#fdba74',
    'dusk': '#c084fc',
    'evening': '#c7d2fe',
  };

  return borderColors[state];
}
