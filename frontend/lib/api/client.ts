import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://web-production-a41f7.up.railway.app/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
