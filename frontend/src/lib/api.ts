import axios from "axios";

// Default configuration for all API calls
// In production, Vercel proxies /api/* to the Render backend (same-domain cookies)
// In development, requests go directly to localhost:3000/api
const api = axios.create({
    baseURL: typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? "/api"  // On Vercel: relative path, proxied to Render via next.config.ts rewrites
        : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
