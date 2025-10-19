# Bounsser - Social Media Impersonation Protection Platform

A hybrid impersonation-detection system for X (Twitter) that protects both individuals and organizations from impersonation attacks through real-time monitoring, intelligent scoring, and automated response systems.

## 🏗️ **Monorepo Structure**

This project uses npm workspaces to manage multiple packages in a single repository:

```
bounsser/
├── bounsser-backend/          # Node.js/TypeScript API server
├── bounsser-frontend/         # Next.js React application
├── package.json             # Root workspace configuration
└── README.md               # This file
```

## 🚀 **Quick Start**

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Docker** and Docker Compose (for database services)
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bounsser

# Install all dependencies (root + workspaces)
npm run install:all

# Start development services (PostgreSQL, Redis)
npm run docker:up

# Run both frontend and backend concurrently
npm run dev
```

Your applications will be available at:
- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:3000
- **API Documentation**: http://localhost:5000/api-docs

## 📦 **Workspace Commands**

### Development

```bash
# Run both applications concurrently
npm run dev

# Run applications separately
npm run dev:backend    # Backend only (port 5000)
npm run dev:frontend   # Frontend only (port 3000)
```

### Building

```bash
# Build both applications
npm run build

# Build separately
npm run build:backend
npm run build:frontend
```

### Production

```bash
# Start both applications in production mode
npm run start

# Start separately
npm run start:backend
npm run start:frontend
```

### Testing

```bash
# Run backend tests
npm run test
npm run test:backend

# Run frontend tests (when available)
npm run test:frontend
```

### Code Quality

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run typecheck
```

### Database Operations

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Run database migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database with sample data
npm run db:seed

# Reset database (DESTRUCTIVE)
npm run db:reset
```

### Docker Services

```bash
# Start all services (PostgreSQL, Redis, monitoring)
npm run docker:up

# Stop all services
npm run docker:down

# View service logs
npm run docker:logs
```

### Documentation

```bash
# Generate API documentation
npm run docs:generate

# Serve documentation locally
npm run docs:serve
```

## 🛠️ **Development Workflow**

### 1. Initial Setup

```bash
# After cloning, install dependencies
npm run install:all

# Start database services
npm run docker:up

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate
```

### 2. Daily Development

```bash
# Start development servers
npm run dev

# In separate terminals, you can run:
npm run test:backend      # Run tests in watch mode
npm run lint             # Check code quality
npm run typecheck        # Verify TypeScript
```

### 3. Before Committing

```bash
# Check everything is working
npm run lint             # Fix any linting issues
npm run typecheck        # Ensure no type errors
npm run test            # Run test suite
npm run build           # Verify builds work
```

## 🏗️ **Architecture Overview**

### Backend (bounsser-backend)

- **Runtime**: Node.js 18+ with TypeScript ES Modules
- **Framework**: Express.js with comprehensive middleware
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with BullMQ for job processing
- **API Integration**: twitter-api-v2 for X/Twitter API
- **Monitoring**: Winston logging, Prometheus metrics
- **Testing**: Jest with comprehensive test coverage

### Frontend (bounsser-frontend)

- **Framework**: Next.js 14 with App Router
- **Runtime**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Forms**: React Hook Form with Zod validation
- **State**: React Context and hooks
- **Analytics**: Vercel Analytics integration

## 🔧 **Configuration**

### Environment Variables

**Centralized Environment Configuration**

All environment variables are now managed from the root directory:

```bash
# Copy example file to get started
cp .env.example .env

# Validate environment setup
npm run env:validate

# Generate secure secrets if needed
npm run env:validate --generate
```

### Port Configuration

Default ports used by the system:

- **Backend API**: 5000
- **Frontend App**: 3000
- **PostgreSQL**: 5432
- **Redis**: 6379
- **PgAdmin**: 8080
- **Redis Commander**: 8081
- **Prometheus**: 9091
- **Grafana**: 3002

To change frontend port, update `bounsser-frontend/package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p 3000"
  }
}
```

## 🔧 **Environment Management**

### Centralized Configuration

All environment variables for both frontend and backend are managed from a single root `.env.local` file:

```bash
# Validate environment setup
npm run env:validate

# Copy example file to get started
npm run env:copy

# Generate secure secrets
npm run env:validate --generate
```

### Required Configuration

Essential variables you need to configure:

1. **Twitter API Credentials** (required for functionality)
2. **Security Secrets** (JWT, Session, Encryption keys)
3. **Database URLs** (PostgreSQL and Redis)
4. **Application URLs** (Frontend and Backend)

### Environment Validation

The setup includes comprehensive environment validation:

```bash
# Check all environment variables
npm run env:validate

# Get help with environment setup
npm run env:validate --help
```

## 🧪 **Testing Strategy**

### Backend Testing

```bash
# Run all tests
npm run test:backend

# Run tests in watch mode
cd bounsser-backend && npm run test:watch

# Run tests with coverage
cd bounsser-backend && npm run test:coverage

# Run end-to-end tests
cd bounsser-backend && npm run test:e2e
```

### API Testing

```bash
# Test API endpoints directly
cd bounsser-backend && node test-api.cjs
```

## 📊 **Monitoring & Observability**

### Health Checks

- **Backend Health**: http://localhost:5000/health
- **API Status**: http://localhost:5000/api/v1/status

### Metrics & Logging

- **Prometheus Metrics**: http://localhost:5000/metrics
- **Grafana Dashboard**: http://localhost:3002 (when monitoring profile is active)
- **Logs**: Check `bounsser-backend/logs/` directory

### Database Management

- **PgAdmin**: http://localhost:8080
  - Email: `admin@bounsser.com`
  - Password: `admin`
- **Prisma Studio**: `npm run db:studio`

### Redis Management

- **Redis Commander**: http://localhost:8081
  - User: `admin`
  - Password: `admin`

## 🚨 **Troubleshooting**

### Common Issues

**Port conflicts:**
```bash
# Check what's running on ports
lsof -i :5000
lsof -i :3000

# Kill processes if needed
kill -9 <PID>
```

**Database connection issues:**
```bash
# Ensure Docker services are running
npm run docker:up

# Check service health
docker-compose -f bounsser-backend/docker-compose.yml ps
```

**Dependencies issues:**
```bash
# Clean and reinstall
npm run clean
rm -rf node_modules
npm run install:all
```

**Prisma issues:**
```bash
# Regenerate Prisma client
npm run db:generate

# Reset database (DESTRUCTIVE)
npm run db:reset
```

**Environment configuration issues:**
```bash
# Validate environment setup
npm run env:validate

# Check specific variables
grep "TWITTER_API_KEY" .env.local

# Regenerate secrets
npm run env:validate --generate
```

### Getting Help

1. **Environment Issues**: Run `npm run env:validate` for detailed diagnostics
2. **Service Issues**: Check the logs: `npm run docker:logs`
3. **Docker Issues**: Verify services are running: `docker ps`
4. **Application Issues**: Check individual workspace README files
5. **Setup Issues**: Review the status documentation: `bounsser-backend/docs/STATUS.md`

## 🛡️ **Security**

### Development Security

- All environment variables are managed centrally in `.env`
- Environment files are never committed to git (`.env` is in `.gitignore`)
- Database credentials are for development only
- API keys should be stored in the root `.env` file
- CORS is configured for development domains
- Security secrets are validated for minimum length requirements

### Production Security

- Copy `.env` to production server and update with production values
- Never use development secrets in production
- Run `npm run env:validate` to ensure all security requirements are met
- Use proper SSL certificates
- Enable audit logging and monitoring
- Follow the deployment guide in `bounsser-backend/docs/DEPLOYMENT.md`

## 📚 **Additional Documentation**

- **Backend API**: See `bounsser-backend/README.md`
- **Frontend App**: See `bounsser-frontend/README.md`
- **API Documentation**: Auto-generated at `bounsser-backend/docs/api/`
- **Development Guide**: `bounsser-backend/docs/DEVELOPMENT_GUIDE.md`
- **Database Schema**: `bounsser-backend/docs/SCHEMA.md`
- **Architecture Decisions**: `bounsser-backend/docs/adr/`

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Standards

- Follow TypeScript strict mode
- Write tests for new features
- Update documentation
- Follow conventional commits
- Ensure all checks pass before submitting PR

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- Built with modern TypeScript and React ecosystems
- Uses industry-standard tools and practices
- Designed for scalability and maintainability
- Community-driven development approach

---

**Happy coding! 🚀**

For questions or support, please check the documentation or open an issue.