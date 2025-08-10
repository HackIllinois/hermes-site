// Frontend configuration using Vite's environment variables
// Environment variables must be prefixed with VITE_ to be accessible in the frontend

export const config = {
    ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || "DEV",
} as const;

export const validateEnv = (): void => {
    const requiredEnvVars = ["VITE_ENVIRONMENT"];

    for (const envVar of requiredEnvVars) {
        if (!import.meta.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
};

// Base URLs for different environments
export const BASE_FRONTEND_URL = config.ENVIRONMENT === "DEV" 
    ? "http://localhost:3000" 
    : "https://hermes.hackillinois.org";

export const BASE_BACKEND_URL = config.ENVIRONMENT === "DEV" 
    ? "http://localhost:5555/api" 
    : "https://hermes.hackillinois.org/api";

// Helper function to check if we're in development
export const isDevelopment = (): boolean => config.ENVIRONMENT === "DEV";

// Helper function to check if we're in production
export const isProduction = (): boolean => config.ENVIRONMENT === "PROD"; 