// API Configuration
export const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 
                           "https://chatapp-fjyj.onrender.com";

console.log("API_BASE_URL =", API_BASE_URL);

export default API_BASE_URL;