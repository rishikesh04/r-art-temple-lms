import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // Vite proxy handles routing this to localhost:3000
  withCredentials: true, // IMPORTANT: This sends  JWT cookies securely!
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;