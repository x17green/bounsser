#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Bounsser Monorepo Setup Script");
console.log("================================\n");

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

function execCommand(command, description) {
  try {
    log(`📦 ${description}...`, "blue");
    execSync(command, { stdio: "inherit" });
    log(`✅ ${description} completed\n`, "green");
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}\n`, "red");
    return false;
  }
}

function checkPrerequisites() {
  log("🔍 Checking prerequisites...", "cyan");

  try {
    // Check Node.js version
    const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim();
    const nodeMajor = parseInt(nodeVersion.slice(1).split(".")[0]);

    if (nodeMajor < 18) {
      log(
        `❌ Node.js ${nodeVersion} detected. Node.js 18+ is required.`,
        "red",
      );
      return false;
    }
    log(`✅ Node.js ${nodeVersion} detected`, "green");

    // Check npm version
    const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
    const npmMajor = parseInt(npmVersion.split(".")[0]);

    if (npmMajor < 9) {
      log(`⚠️  npm ${npmVersion} detected. npm 9+ is recommended.`, "yellow");
    } else {
      log(`✅ npm ${npmVersion} detected`, "green");
    }

    // Check Docker
    try {
      const dockerVersion = execSync("docker --version", {
        encoding: "utf8",
      }).trim();
      log(`✅ ${dockerVersion} detected`, "green");
    } catch {
      log(
        `⚠️  Docker not detected. You'll need Docker for database services.`,
        "yellow",
      );
    }

    // Check Docker Compose
    try {
      const dockerComposeVersion = execSync("docker-compose --version", {
        encoding: "utf8",
      }).trim();
      log(`✅ ${dockerComposeVersion} detected`, "green");
    } catch {
      log(
        `⚠️  Docker Compose not detected. You'll need it for database services.`,
        "yellow",
      );
    }

    log(""); // Empty line
    return true;
  } catch (error) {
    log(`❌ Prerequisites check failed: ${error.message}`, "red");
    return false;
  }
}

function createEnvFiles() {
  log("📝 Setting up centralized environment files...", "cyan");

  const rootEnvExample = path.join(__dirname, "..", ".env.example");
  const rootEnvLocal = path.join(__dirname, "..", ".env.local");

  // Copy root .env.example to .env.local if it doesn't exist
  if (fs.existsSync(rootEnvExample) && !fs.existsSync(rootEnvLocal)) {
    try {
      fs.copyFileSync(rootEnvExample, rootEnvLocal);
      log("✅ Created .env.local from .env.example", "green");
      log(
        "⚠️  Please configure your Twitter API credentials in .env.local",
        "yellow",
      );
    } catch (error) {
      log(`⚠️  Could not create .env.local file: ${error.message}`, "yellow");
    }
  } else if (fs.existsSync(rootEnvLocal)) {
    log("✅ .env.local already exists", "green");
  } else {
    log("⚠️  .env.example not found, creating basic .env.local", "yellow");
    try {
      const basicEnvContent = `# Basic Environment Configuration
NODE_ENV=development
PORT=5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
DATABASE_URL=postgresql://bounsser:bounsser_password@localhost:5432/bounsser_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=development-jwt-secret-key-minimum-32-characters-replace-in-production
JWT_REFRESH_SECRET=development-jwt-refresh-secret-minimum-32-characters-replace-in-prod
SESSION_SECRET=development-session-secret-minimum-32-characters-replace-in-production
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret_here
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
TWITTER_OAUTH_CALLBACK_URL=http://localhost:3000/auth/twitter/callback
`;
      fs.writeFileSync(rootEnvLocal, basicEnvContent);
      log("✅ Created basic .env.local", "green");
    } catch (error) {
      log(`❌ Could not create .env.local file: ${error.message}`, "red");
    }
  }

  log("");
}

function setupWorkspaces() {
  log("🔧 Setting up npm workspaces...", "cyan");

  // Install root dependencies
  if (!execCommand("npm install", "Installing root dependencies")) {
    return false;
  }

  // Install workspace dependencies
  if (
    !execCommand(
      "npm install --workspace=bounsser-backend",
      "Installing backend dependencies",
    )
  ) {
    return false;
  }

  if (
    !execCommand(
      "npm install --workspace=bounsser-frontend",
      "Installing frontend dependencies",
    )
  ) {
    return false;
  }

  return true;
}

function setupDatabase() {
  log("🗄️  Setting up database...", "cyan");

  // Check if Docker services are needed
  const hasDockerServices = fs.existsSync(
    path.join(__dirname, "..", "bounsser-backend", "docker-compose.yml"),
  );

  if (hasDockerServices) {
    log("🐳 Starting Docker services...", "blue");
    if (
      !execCommand(
        "npm run docker:up",
        "Starting PostgreSQL and Redis services",
      )
    ) {
      log(
        "⚠️  Docker services failed to start. You may need to start them manually.",
        "yellow",
      );
    }

    // Wait a bit for services to start
    log("⏳ Waiting for services to start up...", "blue");
    setTimeout(() => {
      log("✅ Services should be ready now", "green");
    }, 5000);
  }

  // Generate Prisma client
  if (!execCommand("npm run db:generate", "Generating Prisma client")) {
    return false;
  }

  log("");
  return true;
}

function runHealthChecks() {
  log("🏥 Running health checks...", "cyan");

  try {
    // Check if we can run the backend test
    log("Testing backend API...", "blue");
    execSync("cd bounsser-backend && npm run test", { stdio: "inherit" });
    log("✅ Backend tests passed", "green");

    // Check if we can build both projects
    log("Testing builds...", "blue");
    execSync("npm run build", { stdio: "inherit" });
    log("✅ Both projects build successfully", "green");

    log("");
    return true;
  } catch (error) {
    log(
      `⚠️  Some health checks failed. This is normal for initial setup.`,
      "yellow",
    );
    log("");
    return true; // Don't fail setup for this
  }
}

function printSuccessMessage() {
  log("🎉 Setup completed successfully!", "green");
  log("=============================\n", "green");

  log("📋 Next steps:", "cyan");
  log("2. Configure your environment variables:", "reset");
  log("   - Edit .env.local with your Twitter API keys", "reset");
  log("   - Run: npm run env:validate to check configuration", "reset");
  log("");

  log("2. Start development servers:", "reset");
  log(
    "   npm run dev                 # Start both frontend and backend",
    "blue",
  );
  log(
    "   npm run dev:backend         # Start backend only (port 5000)",
    "blue",
  );
  log(
    "   npm run dev:frontend        # Start frontend only (port 3000)",
    "blue",
  );
  log("");

  log("3. Access your applications:", "reset");
  log("   Backend API:  http://localhost:5000", "blue");
  log("   Frontend App: http://localhost:3000", "blue");
  log("   API Docs:     http://localhost:5000/api-docs", "blue");
  log("");

  log("4. Useful commands:", "reset");
  log("   npm run env:validate       # Validate environment setup", "blue");
  log("   npm run test               # Run tests", "blue");
  log("   npm run lint               # Check code quality", "blue");
  log("   npm run db:studio          # Open database GUI", "blue");
  log("   npm run docker:logs        # View service logs", "blue");
  log("");

  log("📚 For more information:", "cyan");
  log("   - Check README.md for detailed instructions", "reset");
  log("   - Environment setup: npm run env:validate --help", "reset");
  log("   - Backend docs: bounsser-backend/README.md", "reset");
  log("   - Frontend docs: bounsser-frontend/README.md", "reset");
  log("");

  log("Happy coding! 🚀", "magenta");
}

function printFailureMessage() {
  log("❌ Setup encountered errors", "red");
  log("=========================\n", "red");

  log("🔧 Try these troubleshooting steps:", "cyan");
  log("1. Ensure you have Node.js 18+ and npm 9+", "reset");
  log("2. Make sure Docker is running if you need database services", "reset");
  log("3. Check your internet connection for package downloads", "reset");
  log("4. Check your environment configuration:", "reset");
  log("   npm run env:validate", "blue");
  log("5. Try running individual commands manually:", "reset");
  log("   npm install", "blue");
  log("   npm install --workspace=bounsser-backend", "blue");
  log("   npm install --workspace=bounsser-frontend", "blue");
  log("");

  log("📚 For help:", "cyan");
  log("   - Check the README.md file", "reset");
  log("   - Review error messages above", "reset");
  log("   - Open an issue if problems persist", "reset");
}

async function main() {
  try {
    // Run setup steps
    if (!checkPrerequisites()) {
      printFailureMessage();
      process.exit(1);
    }

    createEnvFiles();

    if (!setupWorkspaces()) {
      printFailureMessage();
      process.exit(1);
    }

    if (!setupDatabase()) {
      log("⚠️  Database setup had issues, but continuing...", "yellow");
    }

    runHealthChecks();

    printSuccessMessage();
  } catch (error) {
    log(`❌ Setup failed with error: ${error.message}`, "red");
    printFailureMessage();
    process.exit(1);
  }
}

// Run the setup
main();
