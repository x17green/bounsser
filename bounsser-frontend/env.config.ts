/** @type {import('next').NextConfig} */

// Load environment variables from root directory
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types for environment configuration
interface EnvVars {
  [key: string]: string;
}

interface ApiConfig {
  baseUrl: string;
  appUrl: string;
  version: string;
}

interface EnvConfig {
  env: EnvVars;
  getEnv: (key: string, defaultValue?: string) => string;
  getPublicEnv: () => EnvVars;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  apiConfig: ApiConfig;
}

// Frontend-relevant environment variable keys
const FRONTEND_KEYS: readonly string[] = [
  "APP_URL",
  "API_VERSION",
  "APP_NAME",
  "CORS_ORIGIN",
  "DEV_ENABLE_SWAGGER",
  "DEV_ENABLE_PLAYGROUND",
] as const;

// Type for frontend environment keys
type FrontendKey = typeof FRONTEND_KEYS[number];

// Function to load and parse environment file
function loadEnvFile(filePath: string): EnvVars {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const envContent: string = fs.readFileSync(filePath, "utf8");
  const envVars: EnvVars = {};

  envContent.split("\n").forEach((line: string) => {
    // Skip comments and empty lines
    if (line.trim() === "" || line.trim().startsWith("#")) {
      return;
    }

    // Parse KEY=VALUE format
    const match: RegExpMatchArray | null = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key: string = match[1].trim();
      let value: string = match[2].trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      envVars[key] = value;
    }
  });

  return envVars;
}

// Load environment files from root directory
const rootDir: string = path.resolve(__dirname, "..");
const envLocal: EnvVars = loadEnvFile(path.join(rootDir, ".env.local"));
const envExample: EnvVars = loadEnvFile(path.join(rootDir, ".env.example"));

// Merge environment variables (local takes precedence)
const mergedEnv: EnvVars = { ...envExample, ...envLocal };

// Extract Next.js public variables and other frontend-specific variables
const frontendEnv: EnvVars = {};

Object.keys(mergedEnv).forEach((key: string) => {
  const value: string = mergedEnv[key];

  // Include NEXT_PUBLIC_ variables for client-side access
  if (key.startsWith("NEXT_PUBLIC_")) {
    frontendEnv[key] = value;
  }

  // Include NODE_ENV for build configuration
  // if (key === "NODE_ENV") {
  //   frontendEnv[key] = value;
  // }

  // Include other frontend-relevant variables
  if (FRONTEND_KEYS.includes(key as FrontendKey)) {
    frontendEnv[key] = value;
  }
});

// Set environment variables for Next.js
Object.keys(frontendEnv).forEach((key: string) => {
  if (!process.env[key]) {
    process.env[key] = frontendEnv[key];
  }
});

// Helper function to get environment variables with type safety
const getEnv = (key: string, defaultValue: string = ""): string => {
  return frontendEnv[key] || process.env[key] || defaultValue;
};

// Get all public environment variables for client-side
const getPublicEnv = (): EnvVars => {
  const publicEnv: EnvVars = {};
  Object.keys(frontendEnv).forEach((key: string) => {
    if (key.startsWith("NEXT_PUBLIC_")) {
      publicEnv[key] = frontendEnv[key];
    }
  });
  return publicEnv;
};

// Environment type checking
const nodeEnv: string = frontendEnv.NODE_ENV || "development";
const isDevelopment: boolean = nodeEnv === "development";
const isProduction: boolean = nodeEnv === "production";
const isTest: boolean = nodeEnv === "test";

// API configuration with defaults
const apiConfig: ApiConfig = {
  baseUrl: getEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:5000/api/v1"),
  appUrl: getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  version: getEnv("API_VERSION", "v1"),
};

// Export configuration for use in next.config.mjs
const envConfig: EnvConfig = {
  env: frontendEnv,
  getEnv,
  getPublicEnv,
  isDevelopment,
  isProduction,
  isTest,
  apiConfig,
};

// Console log for debugging (only in development)
if (isDevelopment) {
  console.log("🔧 Frontend Environment Configuration Loaded:");
  console.log(
    "   Public Variables:",
    Object.keys(frontendEnv).filter((k: string) => k.startsWith("NEXT_PUBLIC_")).length,
  );
  console.log(
    "   API Base URL:",
    getEnv("NEXT_PUBLIC_API_BASE_URL") || "Not set",
  );
  console.log("   App URL:", getEnv("NEXT_PUBLIC_APP_URL") || "Not set");
  console.log("   Environment:", nodeEnv || "Not set");
}

export default envConfig;

// Export types for use in other files
export type { EnvVars, ApiConfig, EnvConfig, FrontendKey };

// Export individual functions for direct use
export { getEnv, getPublicEnv, isDevelopment, isProduction, isTest, apiConfig };
