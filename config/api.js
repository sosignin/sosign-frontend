// Configuration for API URLs
const config = {
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://api.sosign.in"), // Production backend URL as fallback
};

export default config;

