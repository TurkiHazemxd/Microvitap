import { Platform } from 'react-native';
const COMPUTER_IP = '172.20.10.11'; // Your computer's IP

export const API_URL = `http://${COMPUTER_IP}:3001`;      // Mobile backend (NestJS)
export const CHATBOT_URL = `http://${COMPUTER_IP}:5000`;  // Python chatbot backend

export const getImageUrl = (imageName: string) => {
  if (!imageName) {
    return null;
  }
  const url = `${API_URL}/images/${imageName}`;
  return url;
};
