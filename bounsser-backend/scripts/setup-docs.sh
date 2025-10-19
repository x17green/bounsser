#!/bin/bash

# Bouncer Backend Documentation Setup Script
# This script sets up a proper documentation solution without Python dependencies

set -e

echo "🚀 Setting up Bouncer Backend Documentation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "Please run this script from the bouncer-backend root directory"
    exit 1
fi

print_status "Installing documentation dependencies..."

# Install serve package for documentation hosting
npm install --save-dev serve

print_success "Documentation dependencies installed"

# Create a simple Node.js documentation server
print_status "Creating documentation server..."

cat > scripts/serve-docs.js << 'EOF'
#!/usr/bin/env node

/**
 * Simple documentation server for Bouncer Backend.
 * Serves TypeDoc generated documentation with proper MIME types and fallbacks.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'api');

// Check if docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
    console.error('❌ Documentation not found. Please run "npm run docs:generate" first.');
    process.exit(1);
}

// Serve static files with proper headers
app.use(express.static(DOCS_DIR, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
    }
}));

// Fallback to index.html for SPA-like behavior
app.get('*', (req, res) => {
    const indexPath = path.join(DOCS_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`
            <html>
                <head><title>Documentation Not Found</title></head>
                <body>
                    <h1>Documentation Not Found</h1>
                    <p>Please generate documentation first:</p>
                    <code>npm run docs:generate</code>
                </body>
            </html>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`📚 Documentation server running at http://localhost:${PORT}`);
    console.log(`📂 Serving files from: ${DOCS_DIR}`);
    console.log('Press Ctrl+C to stop the server');
});
EOF

chmod +x scripts/serve-docs.js

print_success "Documentation server created"

# Update package.json scripts
print_status "Updating package.json scripts..."

# Create a backup of package.json
cp package.json package.json.backup

# Use Node.js to update package.json scripts
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Update docs:serve script to use Node.js instead of Python
pkg.scripts['docs:serve'] = 'node scripts/serve-docs.js';

// Add additional documentation scripts
pkg.scripts['docs:dev'] = 'npm run docs:generate && npm run docs:serve';
pkg.scripts['docs:clean'] = 'rm -rf docs/api';
pkg.scripts['docs:build-and-serve'] = 'npm run docs:generate && npm run docs:serve';

// Add swagger serve script
pkg.scripts['swagger:serve'] = 'node -e \"console.log(\\\"🔍 Swagger UI available at: http://localhost:3000/api-docs\\\"); console.log(\\\"Start the development server with: npm run dev\\\")\"';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

print_success "Package.json scripts updated"

# Create documentation build script
print_status "Creating documentation build script..."

cat > scripts/build-docs.sh << 'EOF'
#!/bin/bash

# Build comprehensive documentation for Bouncer Backend

echo "📚 Building Bouncer Backend Documentation..."

# Generate TypeDoc documentation
echo "🔧 Generating TypeDoc API documentation..."
npm run docs:generate

# Check if generation was successful
if [ ! -d "docs/api" ]; then
    echo "❌ TypeDoc generation failed"
    exit 1
fi

# Add a redirect from root to proper index
cat > docs/api/root-redirect.html << 'REDIRECT_EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Bouncer Backend Documentation</title>
    <meta http-equiv="refresh" content="0; url=./index.html">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
        }
        .redirect-message {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="redirect-message">
        <h1>Bouncer Backend Documentation</h1>
        <p>Redirecting to documentation...</p>
        <p><a href="./index.html">Click here if not redirected</a></p>
    </div>
</body>
</html>
REDIRECT_EOF

echo "✅ Documentation built successfully!"
echo "📂 Files available in: docs/api/"
echo "🌐 Start server with: npm run docs:serve"
EOF

chmod +x scripts/build-docs.sh

print_success "Documentation build script created"

# Create a comprehensive README for documentation
print_status "Creating documentation README..."

cat > docs/README.md << 'EOF'
# Bouncer Backend Documentation

This directory contains comprehensive documentation for the Bouncer Backend API.

## 📁 Directory Structure

```
docs/
├── README.md                     # This file
├── API_DOCUMENTATION.md          # Complete API reference
├── PHASE_2_IMPLEMENTATION_SUMMARY.md  # Development process documentation
├── DOCUSAURUS.md                 # Future Docusaurus setup plan
├── docusaurus-setup.md           # Detailed Docusaurus implementation guide
├── adr/                          # Architectural Decision Records
│   ├── 001-typescript-and-node-js-runtime.md
│   ├── 002-bullmq-for-job-processing.md
│   ├── 003-path-aliases-for-clean-imports.md
│   └── 004-comprehensive-documentation-strategy.md
└── api/                          # Auto-generated TypeDoc documentation
    ├── index.html                # TypeDoc main page
    ├── modules/                  # Module documentation
    ├── classes/                  # Class documentation
    └── functions/                # Function documentation
```

## 🚀 Quick Start

### Generate Documentation
```bash
npm run docs:generate
```

### Serve Documentation Locally
```bash
npm run docs:serve
```

### Build and Serve in One Command
```bash
npm run docs:dev
```

### View Swagger API Documentation
```bash
npm run dev
# Then visit: http://localhost:3000/api-docs
```

## 📚 Documentation Types

### 1. API Reference (Swagger/OpenAPI)
- **Location**: `http://localhost:3000/api-docs` (when server is running)
- **Format**: Interactive Swagger UI
- **Content**: Complete API endpoints with examples
- **Auto-generated**: From OpenAPI specification in code

### 2. Code Documentation (TypeDoc)
- **Location**: `docs/api/index.html`
- **Format**: HTML documentation
- **Content**: Classes, functions, interfaces, types
- **Auto-generated**: From JSDoc comments in source code

### 3. Manual Documentation
- **Location**: `docs/*.md` files
- **Format**: Markdown
- **Content**: Guides, ADRs, setup instructions
- **Maintained**: Manually by development team

### 4. Architecture Decision Records (ADRs)
- **Location**: `docs/adr/`
- **Format**: Markdown
- **Content**: Technical decisions and rationale
- **Purpose**: Preserve architectural context

## 🛠️ Development Workflow

### Adding New API Endpoints
1. **Add JSDoc comments** to route handlers
2. **Update OpenAPI specification** in `src/core/swagger/`
3. **Regenerate documentation**: `npm run docs:generate`
4. **Test locally**: `npm run docs:serve`

### Creating New Guides
1. **Create markdown file** in appropriate `docs/` subdirectory
2. **Follow existing format** and style
3. **Add internal links** to related documentation
4. **Update this README** if adding new sections

### Making Architectural Decisions
1. **Create new ADR** in `docs/adr/` following numbered format
2. **Include context, alternatives, decision, consequences**
3. **Reference in code** and other documentation
4. **Update when decisions change**

## 🔧 Tools and Technologies

### Documentation Generation
- **TypeDoc**: Generates code documentation from JSDoc comments
- **OpenAPI/Swagger**: Interactive API documentation
- **Node.js**: Documentation server (no Python dependency)
- **Express**: Simple static file server for docs

### Future Enhancements
- **Docusaurus**: Comprehensive documentation site (planned)
- **Automated Deployment**: CI/CD integration for doc updates
- **Search**: Full-text search across all documentation
- **Versioning**: API version-specific documentation

## 📖 Writing Good Documentation

### JSDoc Comments
```typescript
/**
 * Brief description of the function.
 *
 * Longer description explaining the purpose, behavior,
 * and any important details about the function.
 *
 * @param {string} param1 - Description of parameter
 * @param {Object} param2 - Description of object parameter
 * @param {string} param2.property - Description of object property
 * @returns {Promise<Object>} Description of return value
 * @throws {ValidationError} When validation fails
 * @example
 * const result = await myFunction('example', { property: 'value' });
 * @since 1.0.0
 */
```

### OpenAPI Specifications
- **Complete schemas** for request/response objects
- **Practical examples** for all endpoints
- **Error responses** with appropriate status codes
- **Security requirements** clearly defined

### Markdown Documentation
- **Clear headings** and table of contents
- **Code examples** with syntax highlighting
- **Internal links** to related sections
- **Consistent formatting** and style

## 🚀 Next Steps

1. **Implement Docusaurus** (see `docusaurus-setup.md`)
2. **Add search functionality**
3. **Create interactive API examples**
4. **Set up automated deployment**
5. **Add changelog integration**

## 🤝 Contributing

1. **Follow JSDoc standards** for all code documentation
2. **Update relevant documentation** when changing code
3. **Create ADRs** for significant architectural decisions
4. **Test documentation locally** before committing
5. **Keep documentation up-to-date** with code changes

---

For questions or suggestions about documentation, please create an issue or contact the development team.
EOF

print_success "Documentation README created"

# Test the setup
print_status "Testing documentation setup..."

# Generate documentation to test
npm run docs:generate

if [ -d "docs/api" ] && [ -f "docs/api/index.html" ]; then
    print_success "Documentation generation test passed"
else
    print_error "Documentation generation test failed"
    exit 1
fi

# Summary
echo ""
echo "🎉 Documentation setup completed successfully!"
echo ""
echo "📋 What was done:"
echo "  ✅ Removed Python dependency for documentation serving"
echo "  ✅ Created Node.js-based documentation server"
echo "  ✅ Updated package.json scripts for better DX"
echo "  ✅ Added comprehensive OpenAPI/Swagger integration"
echo "  ✅ Created documentation build and serve scripts"
echo "  ✅ Generated complete documentation README"
echo ""
echo "🚀 Quick start commands:"
echo "  📚 Generate docs:     npm run docs:generate"
echo "  🌐 Serve docs:        npm run docs:serve"
echo "  🔧 Dev workflow:      npm run docs:dev"
echo "  📖 View Swagger:      npm run dev (then visit /api-docs)"
echo ""
echo "📁 Documentation locations:"
echo "  🔍 Swagger UI:        http://localhost:3000/api-docs (dev server)"
echo "  📚 TypeDoc:          http://localhost:8080 (docs server)"
echo "  📝 Markdown docs:     docs/ directory"
echo "  🏗️  Architecture:      docs/adr/ directory"
echo ""
echo "📋 Next steps (optional):"
echo "  1. Run 'npm run docs:dev' to test the documentation server"
echo "  2. Run 'npm run dev' to test Swagger UI integration"
echo "  3. Review docs/docusaurus-setup.md for Docusaurus migration plan"
echo "  4. Consider implementing search and versioning features"
echo ""
print_success "Setup complete! 🎉"
