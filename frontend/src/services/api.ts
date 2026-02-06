import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  // Don't set default Content-Type - let Axios determine it automatically
  // For JSON: Axios sets 'application/json' when data is an object
  // For FormData: Browser sets 'multipart/form-data' with correct boundary
});

export default api;

