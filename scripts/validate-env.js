#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Bounsser Environment Validation");
console.log("=================================\n");

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Function to parse environment file
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const vars = {};

  content.split("\n").forEach((line) => {
    if (line.trim() === "" || line.trim().startsWith("#")) {
      return;
    }

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      vars[key] = value;
    }
  });

  return vars;
}

// Required environment variables
const requiredVars = [
  "NODE_ENV",
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "SESSION_SECRET",
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_APP_URL",
];

// Development-required variables (for Twitter integration)
const developmentVars = [
  "TWITTER_API_KEY",
  "TWITTER_API_SECRET",
  "TWITTER_ACCESS_TOKEN",
  "TWITTER_ACCESS_TOKEN_SECRET",
  "TWITTER_CLIENT_ID",
  "TWITTER_CLIENT_SECRET",
  "TWITTER_OAUTH_CALLBACK_URL",
];

// Security validation rules
const securityRules = {
  JWT_SECRET: { minLength: 32, pattern: null },
  JWT_REFRESH_SECRET: { minLength: 32, pattern: null },
  SESSION_SECRET: { minLength: 32, pattern: null },
  ENCRYPTION_KEY: { length: 64, pattern: /^[0-9a-fA-F]{64}$/ },
};

function validateEnvironment() {
  const rootDir = process.cwd();
  const envLocalPath = path.join(rootDir, ".env.local");
  const envExamplePath = path.join(rootDir, ".env.example");

  log("📁 Checking environment files...", "blue");

  // Check if files exist
  const envLocal = parseEnvFile(envLocalPath);
  const envExample = parseEnvFile(envExamplePath);

  if (!envExample) {
    log("❌ .env.example file not found", "red");
    return false;
  }
  log("✅ .env.example found", "green");

  if (!envLocal) {
    log("❌ .env.local file not found", "red");
    log("💡 Run: npm run env:copy", "yellow");
    return false;
  }
  log("✅ .env.local found", "green");

  log("");

  // Validate required variables
  log("🔑 Validating required variables...", "blue");
  let hasErrors = false;

  requiredVars.forEach((varName) => {
    if (!envLocal[varName] || envLocal[varName] === "") {
      log(`❌ ${varName} is required but not set`, "red");
      hasErrors = true;
    } else {
      log(`✅ ${varName}`, "green");
    }
  });

  log("");

  // Validate development variables
  log("🔧 Validating development variables...", "blue");
  const isProduction = envLocal.NODE_ENV === "production";

  if (!isProduction) {
    developmentVars.forEach((varName) => {
      if (
        !envLocal[varName] ||
        envLocal[varName] === "" ||
        envLocal[varName].includes("your_") ||
        envLocal[varName].includes("_here")
      ) {
        log(
          `⚠️  ${varName} needs to be configured for Twitter integration`,
          "yellow",
        );
      } else {
        log(`✅ ${varName}`, "green");
      }
    });
  }

  log("");

  // Validate security settings
  log("🔒 Validating security settings...", "blue");

  Object.keys(securityRules).forEach((varName) => {
    const value = envLocal[varName];
    const rule = securityRules[varName];

    if (!value) {
      log(`❌ ${varName} is required for security`, "red");
      hasErrors = true;
      return;
    }

    // Check length requirements
    if (rule.minLength && value.length < rule.minLength) {
      log(`❌ ${varName} must be at least ${rule.minLength} characters`, "red");
      hasErrors = true;
    } else if (rule.length && value.length !== rule.length) {
      log(`❌ ${varName} must be exactly ${rule.length} characters`, "red");
      hasErrors = true;
    }

    // Check pattern requirements
    if (rule.pattern && !rule.pattern.test(value)) {
      log(`❌ ${varName} format is invalid`, "red");
      hasErrors = true;
    }

    // Check for development defaults in production
    if (isProduction && value.includes("development")) {
      log(`❌ ${varName} contains development values in production`, "red");
      hasErrors = true;
    }

    if (!hasErrors) {
      log(`✅ ${varName}`, "green");
    }
  });

  log("");

  // Validate URLs
  log("🌐 Validating URLs...", "blue");

  const urlVars = [
    "DATABASE_URL",
    "REDIS_URL",
    "NEXT_PUBLIC_API_BASE_URL",
    "NEXT_PUBLIC_APP_URL",
    "TWITTER_OAUTH_CALLBACK_URL",
  ];

  urlVars.forEach((varName) => {
    const value = envLocal[varName];
    if (value && value !== "" && !value.includes("your_")) {
      try {
        new URL(value);
        log(`✅ ${varName}`, "green");
      } catch {
        // Special handling for DATABASE_URL which might not be a standard URL
        if (varName === "DATABASE_URL" && value.startsWith("postgresql://")) {
          log(`✅ ${varName}`, "green");
        } else if (varName === "REDIS_URL" && value.startsWith("redis://")) {
          log(`✅ ${varName}`, "green");
        } else {
          log(`❌ ${varName} is not a valid URL`, "red");
          hasErrors = true;
        }
      }
    }
  });

  log("");

  // Check for common issues
  log("🔍 Checking for common issues...", "blue");

  // Check if CORS_ORIGIN includes frontend URL
  const corsOrigin = envLocal.CORS_ORIGIN || "";
  const frontendUrl = envLocal.NEXT_PUBLIC_APP_URL || "";
  if (frontendUrl && !corsOrigin.includes(frontendUrl.replace(/\/$/, ""))) {
    log(
      `⚠️  CORS_ORIGIN should include frontend URL: ${frontendUrl}`,
      "yellow",
    );
  } else {
    log("✅ CORS configuration looks good", "green");
  }

  // Check port conflicts
  const backendPort = envLocal.PORT || "3000";
  const frontendAppUrl = envLocal.NEXT_PUBLIC_APP_URL || "";
  const frontendPort = frontendAppUrl.includes(":3001") ? "3001" : "3000";

  if (backendPort === frontendPort) {
    log("❌ Backend and frontend are using the same port", "red");
    hasErrors = true;
  } else {
    log("✅ No port conflicts detected", "green");
  }

  log("");

  // Summary
  if (hasErrors) {
    log("❌ Environment validation failed", "red");
    log("");
    log("🔧 To fix issues:", "cyan");
    log("1. Update .env.local with correct values", "reset");
    log("2. Generate secure secrets (32+ characters)", "reset");
    log("3. Configure Twitter API credentials", "reset");
    log("4. Ensure URLs are valid and accessible", "reset");
    log("");
    return false;
  } else {
    log("✅ Environment validation passed!", "green");
    log("");
    log("🚀 Your environment is properly configured:", "cyan");
    log(`   Environment: ${envLocal.NODE_ENV || "development"}`, "reset");
    log(
      `   Backend URL: ${envLocal.APP_URL || "http://localhost:3000"}`,
      "reset",
    );
    log(
      `   Frontend URL: ${envLocal.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}`,
      "reset",
    );
    log(
      `   Database: ${envLocal.DATABASE_URL ? "✅ Configured" : "❌ Not configured"}`,
      "reset",
    );
    log(
      `   Redis: ${envLocal.REDIS_URL ? "✅ Configured" : "❌ Not configured"}`,
      "reset",
    );
    log("");
    return true;
  }
}

// Additional helper functions
function generateSecrets() {
  log("🔐 Generating secure secrets...", "blue");

  const crypto = require("crypto");

  const jwtSecret = crypto.randomBytes(32).toString("hex");
  const jwtRefreshSecret = crypto.randomBytes(32).toString("hex");
  const sessionSecret = crypto.randomBytes(32).toString("hex");
  const encryptionKey = crypto.randomBytes(32).toString("hex");

  log("");
  log("Add these to your .env.local file:", "cyan");
  log(`JWT_SECRET=${jwtSecret}`, "yellow");
  log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`, "yellow");
  log(`SESSION_SECRET=${sessionSecret}`, "yellow");
  log(`ENCRYPTION_KEY=${encryptionKey}`, "yellow");
  log("");
}

function showHelp() {
  log("");
  log("📚 Environment Validation Commands:", "cyan");
  log(
    "   npm run env:validate         # Validate current environment",
    "reset",
  );
  log(
    "   npm run env:copy             # Copy .env.example to .env.local",
    "reset",
  );
  log(
    "   node scripts/validate-env.js --generate   # Generate secure secrets",
    "reset",
  );
  log("   node scripts/validate-env.js --help       # Show this help", "reset");
  log("");
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  showHelp();
  process.exit(0);
}

if (args.includes("--generate") || args.includes("-g")) {
  generateSecrets();
  process.exit(0);
}

// Run validation
const isValid = validateEnvironment();

if (!isValid) {
  log("💡 Quick fixes:", "cyan");
  log("   npm run env:copy                    # Copy example file", "reset");
  log("   node scripts/validate-env.js -g    # Generate secrets", "reset");
  showHelp();
  process.exit(1);
} else {
  log("🎉 Ready to start development!", "magenta");
  log("   npm run dev", "green");
}
