// Frontend configuration using Vite's environment variables
// Environment variables must be prefixed with VITE_ to be accessible in the frontend

const DEFAULT_FRONTEND_URL = "http://localhost:3000";
const DEFAULT_BACKEND_URL = "http://localhost:5555/api";

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

export const config = {
    ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || "DEV",
    DEFAULT_CONTACT_EMAIL: import.meta.env.VITE_DEFAULT_CONTACT_EMAIL || "contact@hackillinois.org",
    FRONTEND_URL: normalizeBaseUrl(
        import.meta.env.VITE_FRONTEND_URL || DEFAULT_FRONTEND_URL,
    ),
    BACKEND_URL: normalizeBaseUrl(
        import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL,
    ),
} as const;

export const validateEnv = (): void => {
    const requiredEnvVars = [
        "VITE_ENVIRONMENT",
        "VITE_DEFAULT_CONTACT_EMAIL",
        "VITE_FRONTEND_URL",
        "VITE_BACKEND_URL",
    ];

    for (const envVar of requiredEnvVars) {
        if (!import.meta.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }

    console.log("ENVIRONMENT", config.ENVIRONMENT);
};

export const BASE_FRONTEND_URL = config.FRONTEND_URL;

export const BASE_BACKEND_URL = config.BACKEND_URL;

export const DEFAULT_CONTACT_EMAIL = config.DEFAULT_CONTACT_EMAIL;

// Helper function to check if we're in development
export const isDevelopment = (): boolean => config.ENVIRONMENT === "DEV";

// Helper function to check if we're in production
export const isProduction = (): boolean => config.ENVIRONMENT === "PROD"; 
