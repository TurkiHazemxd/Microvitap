import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Microgreens API
export const microgreensApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/microgreens`);
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/microgreens/${id}`);
    return response.json();
  },
  
  search: async (query: string) => {
    const response = await fetch(`${API_URL}/api/microgreens?search=${query}`);
    return response.json();
  },
};

// Recipes API

export const recipesApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/recipes`);
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/recipes/${id}`);
    return response.json();
  },
  
  search: async (query: string) => {
    const response = await fetch(`${API_URL}/api/recipes?search=${query}`);
    return response.json();
  },
};

// Distributors API
export const distributorsApi = {
  getAll: async (type?: string) => {
    const url = type && type !== 'All' ? `${API_URL}/api/distributors?type=${type}` : `${API_URL}/api/distributors`;
    const response = await fetch(url);
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/api/distributors/${id}`);
    return response.json();
  },
  
  create: async (data: any, token: string) => {
    const response = await fetch(`${API_URL}/api/distributors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: string, data: any, token: string) => {
    const response = await fetch(`${API_URL}/api/distributors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/api/distributors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: await getHeaders(),
    });
    return response.json();
  },
  
  updateProfile: async (data: any) => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

};
export const recommendationsApi = {
  submit: async (answers: Record<string, any>) => {
    const token = await AsyncStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/api/recommendations/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ answers }),
    });
    return response.json();
  },

  getUserRecommendations: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/api/recommendations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
