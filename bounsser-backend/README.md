# Bouncer Backend

A hybrid impersonation-detection bot for X (Twitter) that protects both
individuals and organizations from impersonation attacks through real-time
monitoring, intelligent scoring, and automated response systems.

## 🚀 Overview

Bouncer is a scalable, modular backend system built with Node.js and TypeScript
that:

- **Protects individuals** (personal mode): Monitors account
  mentions/replies/DMs via OAuth
- **Protects organizations** (centralized mode): Monitors brand mentions and
  hashtags via filtered streams
- **Detects impersonation** using rule-based and ML-powered scoring engines
- **Takes action** through automated alerts, notifications, and response
  workflows

## 📚 Documentation & Developer Experience

This project emphasizes **living documentation** and exceptional developer
experience:

- **📖 Comprehensive JSDoc** - Every function, class, and API endpoint is
  thoroughly documented
- **🔄 Auto-generated API Docs** - TypeDoc generates beautiful documentation
  from source code
- **🎯 Path Aliases** - Clean imports with `@/` prefix for better code
  organization
- **⚙️ Enhanced Tooling** - Husky git hooks, commitlint, and comprehensive VS
  Code integration
- **📋 ADRs** - Architectural Decision Records document all major technical
  decisions
- **🎨 IDE Integration** - Optimized VS Code workspace with recommended
  extensions

### Quick Start for Developers

```bash
# Generate and view API documentation
npm run docs:generate
npm run docs:serve

# Use VS Code tasks (Ctrl+Shift+P -> "Tasks: Run Task")
# - Generate Documentation
# - Full Build Pipeline
# - Pre-commit Checks
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BOUNCER BACKEND ARCHITECTURE                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   HTTP API      │    │   Webhooks      │    │   Streams    │ │
│  │   (Express)     │    │   (Twitter)     │    │   (Twitter)  │ │
│  └─────────┬───────┘    └──────┬──────────┘    └──────┬───────┘ │
│            │                   │                      │         │
│            └───────────────────┼──────────────────────┘         │
│                                │                                │
│  ┌─────────────────────────────┴────────────────────────────┐   │
│  │                        CORE MODULES                      │   │
│  │                                                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐  │   │
│  │  │  User   │  │   Org   │  │ Ingest  │  │  Features   │  │   │
│  │  │ Module  │  │ Module  │  │ Module  │  │   Module    │  │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────────┘  │   │
│  │                                                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐  │   │
│  │  │ Scoring │  │Decision │  │ Notify  │  │ Monitoring  │  │   │
│  │  │ Module  │  │ Module  │  │ Module  │  │   Module    │  │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    WORKER PROCESSES                        │ │
│  │                                                            │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │   Stream    │  │  Webhook    │  │      Scoring        │ │ │
│  │  │   Worker    │  │   Worker    │  │      Worker         │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     DATA LAYER                             │ │
│  │                                                            │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │ PostgreSQL  │  │    Redis    │  │      BullMQ         │ │ │
│  │  │ (Prisma)    │  │  (Cache)    │  │     (Queues)        │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with BullMQ for job processing
- **API Integration**: twitter-api-v2 for X/Twitter API
- **Monitoring**: Winston logging, Prometheus metrics
- **Testing**: Jest, Supertest, Playwright
- **Deployment**: Docker, Kubernetes ready

## 📁 Project Structure

```
bouncer-backend/
├── src/
│   ├── core/                       # Core application setup
│   │   ├── app.ts                  # Express app configuration
│   │   ├── server.ts               # Server entry point
│   │   ├── config.ts               # Environment configuration
│   │   └── middleware/             # Express middleware
│   │       ├── errorHandler.ts     # Global error handling
│   │       ├── requestId.ts        # Request ID tracking
│   │       ├── maintenance.ts      # Maintenance mode
│   │       ├── metrics.ts          # Prometheus metrics
│   │       ├── auth.ts             # Authentication
│   │       └── validation.ts       # Request validation
│   │
│   ├── modules/                    # Feature modules
│   │   ├── user/                   # User management & OAuth
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.model.ts
│   │   │   └── user.routes.ts
│   │   ├── org/                    # Organization management
│   │   ├── ingest/                 # Data ingestion (webhooks/streams)
│   │   ├── features/               # Feature extraction engine
│   │   ├── scoring/                # Impersonation scoring
│   │   ├── decision/               # Decision & action engine
│   │   ├── notifications/          # Alert & notification system
│   │   ├── monitoring/             # System monitoring
│   │   └── shared/                 # Shared utilities & types
│   │       ├── types/              # TypeScript type definitions
│   │       ├── utils/              # Utility functions
│   │       └── constants/          # Application constants
│   │
│   ├── workers/                    # Background job processors
│   │   ├── stream.worker.ts        # Twitter stream processing
│   │   ├── webhook.worker.ts       # Webhook event processing
│   │   ├── scoring.worker.ts       # Impersonation scoring
│   │   └── index.ts                # Worker management
│   │
│   └── db/                         # Database layer
│       ├── index.ts                # Prisma client
│       └── seed.ts                 # Database seeding
│
├── prisma/                         # Database schema & migrations
│   ├── schema.prisma               # Prisma schema definition
│   └── migrations/                 # Database migrations
│
├── tests/                          # Test suites
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   ├── e2e/                        # End-to-end tests
│   └── fixtures/                   # Test data fixtures
│
├── docker/                         # Docker configurations
│   ├── Dockerfile                  # Production Docker image
│   ├── Dockerfile.dev              # Development Docker image
│   └── docker-compose.yml          # Local development stack
│
├── .github/workflows/              # CI/CD pipelines
│   ├── ci.yml                      # Continuous integration
│   ├── cd.yml                      # Continuous deployment
│   └── security.yml                # Security scanning
│
├── docs/                           # Documentation
├── logs/                           # Application logs (gitignored)
└── coverage/                       # Test coverage reports (gitignored)
```

## 🚦 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 14+ database
- Redis 6+ server
- Twitter API v2 credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone 
   cd bouncer-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # Seed initial data (optional)
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` with hot reloading enabled.

### Using Docker

1. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

This will start all required services (app, PostgreSQL, Redis) in containers.

## 🔧 Configuration

All configuration is managed through environment variables. Copy `.env.example`
to `.env` and configure:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bouncer

# Redis
REDIS_URL=redis://localhost:6379

# Twitter API
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret

# Security
JWT_SECRET=your_jwt_secret_32_chars_minimum
ENCRYPTION_KEY=your_32_character_encryption_key
SESSION_SECRET=your_session_secret_32_chars_min
```

### Optional Variables

See `.env.example` for complete configuration options including:

- Notification services (Slack, Discord, Email)
- External integrations
- Monitoring and logging settings
- Rate limiting configurations
- Feature flags

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start with hot reloading
npm run dev

# Run with specific workers
npm run worker:stream
npm run worker:webhook
npm run worker:scoring
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run with Docker Compose

## 🧪 Testing

The project includes comprehensive testing setup:

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Test Structure

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test module interactions
- **E2E Tests**: Test complete user workflows

## 📊 Monitoring & Observability

### Logging

- Structured JSON logging with Winston
- Different log levels (error, warn, info, debug)
- Rotating log files in production
- Request correlation IDs

### Metrics

- Prometheus metrics exposed at `/metrics`
- Custom business metrics for impersonation detection
- Performance and error rate monitoring
- Queue and worker metrics

### Health Checks

- Health endpoint: `/health`
- Readiness probe: `/ready`
- Liveness probe: `/live`
- Database and Redis connectivity checks

## 🚀 Deployment

### Docker Deployment

```bash
# Build production image
docker build -t bouncer-backend .

# Run with environment variables
docker run -p 3000:3000 --env-file .env bouncer-backend
```

### Kubernetes Deployment

Kubernetes manifests are available in the `k8s/` directory:

```bash
kubectl apply -f k8s/
```

### Environment-Specific Configurations

- **Development**: Full logging, metrics disabled, hot reload
- **Staging**: Production-like setup with additional debugging
- **Production**: Optimized performance, security headers, metrics enabled

## 🔒 Security

- Helmet.js for security headers
- Rate limiting on all endpoints
- Input validation with Zod schemas
- JWT-based authentication
- Encrypted sensitive data storage
- CORS configuration
- Security audit logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Use conventional commit messages
- Ensure code passes linting

## 📚 API Documentation

API documentation is available when running in development mode:

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI spec: `http://localhost:3000/api-docs.json`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **Redis Connection Errors**
   - Verify Redis server is running
   - Check REDIS_URL configuration
   - Ensure Redis is accessible

3. **Twitter API Errors**
   - Verify API credentials
   - Check rate limits
   - Ensure callback URLs are correct

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables

### Getting Help

- Check the [Issues](https://github.com/bouncer/bouncer-backend/issues) page
- Review the [Documentation](./docs/)
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🙏 Acknowledgments

- Twitter API v2 for providing the platform integration
- All the open-source libraries that make this project possible
- The security research community for impersonation detection insights

---

**Built with ❤️ for a safer social media experience**
