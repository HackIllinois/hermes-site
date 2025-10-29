// Frontend configuration using Vite's environment variables
// Environment variables must be prefixed with VITE_ to be accessible in the frontend

export const config = {
    ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || "DEV",
    DEFAULT_CONTACT_EMAIL: import.meta.env.VITE_DEFAULT_CONTACT_EMAIL || "contact@hackillinois.org",
} as const;

export const validateEnv = (): void => {
    const requiredEnvVars = ["VITE_ENVIRONMENT", "VITE_DEFAULT_CONTACT_EMAIL"];

    for (const envVar of requiredEnvVars) {
        if (!import.meta.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }

    console.log("ENVIRONMENT", config.ENVIRONMENT);
};

// Base URLs for different environments
export const BASE_FRONTEND_URL = config.ENVIRONMENT === "DEV" 
    ? "http://localhost:3000" 
    : "https://hermes.hackillinois.org";

export const BASE_BACKEND_URL = config.ENVIRONMENT === "DEV" 
    ? "http://localhost:5555/api" 
    : "https://hermes-api.hackillinois.org/api";

export const DEFAULT_CONTACT_EMAIL = config.DEFAULT_CONTACT_EMAIL;

// Helper function to check if we're in development
export const isDevelopment = (): boolean => config.ENVIRONMENT === "DEV";

// Helper function to check if we're in production
export const isProduction = (): boolean => config.ENVIRONMENT === "PROD"; 