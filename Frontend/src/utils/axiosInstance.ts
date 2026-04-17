import axios from 'axios';

const axiosInstance = axios.create({
  // Use VITE_API_URL for production (Render), fallback to '/api' for local proxy
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // IMPORTANT: This sends  JWT cookies securely!
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;