// src/services/guest.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const GUEST_MODE_KEY = 'guest_mode';
const GUEST_ID_KEY = 'guest_id';

export interface GuestUser {
  id: string;
  name: string;
  role: 'guest';
  isGuest: true;
}

// Generate a unique guest ID and save to storage
// Allows browsing without registration
export const enableGuestMode = async (): Promise<GuestUser> => {
  // Unique ID: timestamp + random string
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const guestUser: GuestUser = {
    id: guestId,
    name: 'Invité',
    role: 'guest',
    isGuest: true,
  };
  
  await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
  await AsyncStorage.setItem(GUEST_ID_KEY, guestId);
  await AsyncStorage.setItem('user', JSON.stringify(guestUser));
  
  return guestUser;
};

// Remove all guest data from storage
// Called when user logs in or signs up
export const disableGuestMode = async (): Promise<void> => {
  await AsyncStorage.removeItem(GUEST_MODE_KEY);
  await AsyncStorage.removeItem(GUEST_ID_KEY);
  await AsyncStorage.removeItem('user');
};

// Check if user is browsing as guest
export const isGuestMode = async (): Promise<boolean> => {
  const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
  return guestMode === 'true';
};

// Get guest user data if guest mode is active
export const getGuestUser = async (): Promise<GuestUser | null> => {
  const isGuest = await isGuestMode();
  if (!isGuest) return null;
  
  const userStr = await AsyncStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};