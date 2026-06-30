import axios from 'axios';

// This is the base URL for all API calls to Django
const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;