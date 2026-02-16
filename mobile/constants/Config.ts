import Constants from 'expo-constants';

export const Config = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
  ENV: process.env.EXPO_PUBLIC_ENV || 'development',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
};
