import axios from "axios";

// Default configuration for all API calls
// All requests go to /api/* which is proxied to the backend via Next.js API route
const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
