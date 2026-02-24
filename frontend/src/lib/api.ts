import axios from "axios";

// Default configuration for all API calls
const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true, // Crucial for sending/receiving the HTTP-Only JWT cookie
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
