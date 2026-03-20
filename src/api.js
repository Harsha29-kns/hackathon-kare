import axios from 'axios';

//const api = "http://localhost:3001";
const api = "https://scorecraft-backend-73gb.onrender.com";

// Setup global Axios interceptors to automatically include the JWT token
axios.interceptors.request.use(
    (config) => {
        // Check all possible storage locations for the token based on the user group
        const token = sessionStorage.getItem('adminToken') ||
            sessionStorage.getItem('judgeToken') ||
            sessionStorage.getItem('sectorToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;