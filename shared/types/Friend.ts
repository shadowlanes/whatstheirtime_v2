export interface Friend {
  id: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  lat: number;
  lng: number;
  order: number;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFriendInput {
  name: string;
  city: string;
  country: string;
  timezone: string;
  lat: number;
  lng: number;
}

export interface UpdateFriendInput {
  name?: string;
  city?: string;
  country?: string;
  timezone?: string;
  lat?: number;
  lng?: number;
  order?: number;
}

export interface ReorderFriendsInput {
  friendIds: string[];
}
