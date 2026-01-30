// Automatically detect API URL based on current hostname
// This allows the app to work on both localhost and network IP (e.g., 192.168.x.x)
export const API_URL = window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : `http://${window.location.hostname}:8000`;
