export interface UserLocation {
  id: string;
  userId: string;
  city: string;
  country: string;
  timezone: string;
  lat: number;
  lng: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SetUserLocationInput {
  city: string;
  country: string;
  timezone: string;
  lat: number;
  lng: number;
}
