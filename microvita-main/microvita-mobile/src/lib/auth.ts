import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { isGuestMode, getGuestUser, disableGuestMode } from '../services/guest';

// describes what an authenticated user looks like
export interface AuthedUser {
  id: string;
  email: string;
  name: string;
  role: string;        
  isGuest?: boolean;   
}

// keys used to store data in AsyncStorage
const AUTH_TOKEN_KEY = 'auth_token';  
const USER_KEY = 'user';              

// signin function that calls the backend API to authenticate a user
// saves token and user data, disables any active guest mode

export const signIn = async (email: string, motdepasse: string): Promise<AuthedUser | null> => {
  try {
    // if user was in guest mode before logging in, turn it off
    await disableGuestMode();
    
    console.log('Attempting login with:', { email });
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, motdepasse }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login error:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('Login response:', data);
    
    if (!data || !data.user) {
      console.error('Invalid response structure:', data);
      return null;
    }
    
    // Save authentication token if provided by backend
    if (data.token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }
    // Save user info for quick access across the app
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// create new  account

export const signUp = async (fullname: string, email: string, motdepasse: string): Promise<AuthedUser | null> => {
  try {
    // If user was in guest mode before signing up, turn it off
    await disableGuestMode();
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullname, email, motdepasse }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.user) {
      return null;
    }
    
    // Save token and user data (auto-login after registration)
    if (data.token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
};


// sign out
export const signOut = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
  await disableGuestMode();  // Exit guest mode completely
};

// ============================================
// GET CURRENT USER
// ============================================
// Retrieves the currently logged in user (real OR guest)
// Priority: Check guest mode first, then check for real user in storage
// Returns user object or null if nobody is logged in
export const getUser = async (): Promise<AuthedUser | null> => {
  try {
    // First check if guest mode is active
    const isGuest = await isGuestMode();
    if (isGuest) {
      const guestUser = await getGuestUser();
      if (guestUser) {
        // Return a fake user object for guests
        return {
          id: guestUser.id,
          email: 'guest@microvita.com',
          name: guestUser.name,
          role: 'guest',
          isGuest: true,  // Flag to identify guest users
        };
      }
    }
    
    // No guest mode, check for real logged-in user
    const userStr = await AsyncStorage.getItem(USER_KEY);
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return {
      id: user.id,
      email: user.email,
      name: user.fullname || user.name,  // Handle both field names
      role: user.role,
      isGuest: false,
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};


// check if user is logged in either real or guest
export const isSignedIn = async (): Promise<boolean> => {
  // Allow guest users to access the app (but with limited features)
  const isGuest = await isGuestMode();
  if (isGuest) return true;
  
  // For real users: need both token AND user data
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  const user = await getUser();
  return !!(token && user);
};