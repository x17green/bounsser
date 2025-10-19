# Docusaurus Setup Guide for Bouncer Backend Documentation

## Overview

This guide outlines the complete implementation of Docusaurus for the Bouncer
Backend project documentation, replacing the current TypeDoc + Python approach
with a comprehensive, Node.js-native documentation solution.

## 🎯 Implementation Strategy

### Phase 1: Docusaurus Foundation

1. **Initialize Docusaurus** in a separate `docs/` directory
2. **Integrate with existing project** structure
3. **Configure build and deployment** pipelines
4. **Migrate existing documentation** content

### Phase 2: OpenAPI Integration

1. **Integrate Swagger/OpenAPI** spec with Docusaurus
2. **Create interactive API documentation**
3. **Auto-generate API reference** from OpenAPI spec
4. **Maintain TypeDoc integration** for code documentation

### Phase 3: Enhanced Features

1. **Add versioning** for API versions
2. **Implement search** functionality
3. **Create custom themes** and branding
4. **Add blog** for changelog and updates

## 🏗️ Project Structure

```
bouncer-backend/
├── src/                          # Existing source code
├── docs-site/                    # NEW: Docusaurus site
│   ├── docusaurus.config.ts
│   ├── sidebars.ts
│   ├── package.json
│   ├── docs/                     # Documentation content
│   │   ├── intro.md
│   │   ├── getting-started/
│   │   │   ├── installation.md
│   │   │   ├── quick-start.md
│   │   │   └── configuration.md
│   │   ├── api/
│   │   │   ├── overview.md
│   │   │   ├── authentication.md
│   │   │   ├── users.md
│   │   │   ├── events.md
│   │   │   └── analytics.md
│   │   ├── guides/
│   │   │   ├── twitter-oauth.md
│   │   │   ├── impersonation-detection.md
│   │   │   └── webhooks.md
│   │   ├── architecture/
│   │   │   ├── overview.md
│   │   │   ├── database-design.md
│   │   │   ├── workers.md
│   │   │   └── security.md
│   │   └── contributing/
│   │       ├── development.md
│   │       ├── testing.md
│   │       └── deployment.md
│   ├── static/                   # Static assets
│   │   ├── img/
│   │   ├── schemas/
│   │   └── postman/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── theme/
│   └── versioned_docs/           # Version management
├── docs/                         # Existing docs (to be migrated)
└── package.json                  # Updated with new scripts
```

## 📋 Implementation Steps

### Step 1: Initialize Docusaurus

```bash
# Create Docusaurus site
cd bouncer-backend
npx create-docusaurus@latest docs-site typescript --package-manager npm

# Install additional plugins
cd docs-site
npm install --save @docusaurus/plugin-openapi-docs
npm install --save docusaurus-plugin-openapi-docs
npm install --save @docusaurus/theme-live-codeblock
npm install --save @docusaurus/plugin-google-analytics
npm install --save docusaurus-plugin-sass
```

### Step 2: Configure Docusaurus

**docusaurus.config.ts:**

```typescript
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Bouncer Backend Documentation',
  tagline: 'Twitter/X Impersonation Detection API',
  favicon: 'img/favicon.ico',
  url: 'https://docs.bouncer.example.com',
  baseUrl: '/',
  organizationName: 'bouncer-team',
  projectName: 'bouncer-backend',

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/x17green/bouncer-backend/tree/main/docs-site/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/x17green/bouncer-backend/tree/main/docs-site/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        googleAnalytics: {
          trackingID: 'G-XXXXXXXXXX',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'classic',
        config: {
          bouncer: {
            specPath: '../src/core/swagger/index.ts',
            outputDir: 'docs/api',
            sidebarOptions: {
              groupPathsBy: 'tag',
            },
          },
        },
      },
    ],
  ],

  themes: ['docusaurus-theme-openapi-docs'],

  themeConfig: {
    navbar: {
      title: 'Bouncer',
      logo: {
        alt: 'Bouncer Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/api/overview',
          label: 'API Reference',
          position: 'left',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/x17green/bouncer-backend',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/installation',
            },
            {
              label: 'API Reference',
              to: '/docs/api/overview',
            },
            {
              label: 'Guides',
              to: '/docs/guides/twitter-oauth',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/x17green/bouncer-backend',
            },
            {
              label: 'Issues',
              href: 'https://github.com/x17green/bouncer-backend/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Status Page',
              href: 'https://status.bouncer.example.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Bouncer Team. Built with Docusaurus.`,
    },
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'bouncer-docs',
    },
  },
};

export default config;
```

### Step 3: Update Package.json Scripts

**Root package.json additions:**

```json
{
  "scripts": {
    "docs:dev": "cd docs-site && npm run start",
    "docs:build": "cd docs-site && npm run build",
    "docs:serve": "cd docs-site && npm run serve",
    "docs:deploy": "cd docs-site && npm run deploy",
    "docs:openapi": "cd docs-site && npm run gen-api-docs",
    "docs:clean": "cd docs-site && npm run clear && rm -rf build"
  }
}
```

### Step 4: Content Migration Plan

#### From Existing Documentation

1. **API_DOCUMENTATION.md** → Split into individual API pages
2. **ADRs** → Move to `docs/architecture/decisions/`
3. **README content** → Convert to getting started guides
4. **TypeDoc output** → Integrate as code reference section

#### New Content Structure

````markdown
# docs/intro.md

---

## slug: /

# Welcome to Bouncer Backend Documentation

Bouncer is a comprehensive Twitter/X impersonation detection system...

# docs/getting-started/installation.md

# Installation Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 6+

## Quick Start

```bash
git clone https://github.com/x17green/bouncer-backend.git
cd bouncer-backend
npm install
```
````

### Step 5: OpenAPI Integration

Create custom OpenAPI documentation pages:

**docs/api/overview.md:**

```markdown
---
id: api-overview
title: API Overview
sidebar_label: Overview
---

# Bouncer API Overview

The Bouncer Backend API provides comprehensive endpoints for...

## Base URL
```

https://api.bouncer.example.com/api/v1

```

## Authentication
All API requests require authentication via JWT token...

## Rate Limiting
- Standard endpoints: 100 requests per 15 minutes
- Authentication endpoints: 10 requests per 15 minutes
- Sensitive operations: 3 requests per hour

## Interactive API Explorer
Use the interactive API explorer below to test endpoints:

import ApiDemoPanel from '@site/src/components/ApiDemoPanel';

<ApiDemoPanel />
```

### Step 6: Custom Components

**src/components/ApiDemoPanel.tsx:**

```tsx
import React from 'react';
import CodeBlock from '@theme/CodeBlock';

const ApiDemoPanel: React.FC = () => {
  return (
    <div className='api-demo-panel'>
      <h3>Try the API</h3>
      <p>Test API endpoints directly from this documentation:</p>

      <CodeBlock language='bash'>
        {`curl -X GET "https://api.bouncer.example.com/api/v1/health" \\
  -H "accept: application/json"`}
      </CodeBlock>

      {/* Interactive API testing component */}
    </div>
  );
};

export default ApiDemoPanel;
```

### Step 7: Build and Deployment

**GitHub Actions Workflow (.github/workflows/docs.yml):**

```yaml
name: Deploy Documentation

on:
  push:
    branches: [main]
    paths: ['docs-site/**', 'src/core/swagger/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd docs-site && npm ci

      - name: Generate OpenAPI docs
        run: npm run docs:openapi

      - name: Build documentation
        run: npm run docs:build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-site/build
```

## 🔄 Migration Timeline

### Week 1: Foundation

- [ ] Initialize Docusaurus site
- [ ] Configure basic structure and theming
- [ ] Set up build and deployment pipeline
- [ ] Migrate introduction and getting started content

### Week 2: API Documentation

- [ ] Integrate OpenAPI specification
- [ ] Create interactive API documentation
- [ ] Migrate existing API documentation content
- [ ] Add code examples and tutorials

### Week 3: Content Migration

- [ ] Migrate all ADRs to new structure
- [ ] Create architecture documentation
- [ ] Add development and contributing guides
- [ ] Set up blog for changelogs

### Week 4: Enhancement & Polish

- [ ] Add search functionality
- [ ] Implement versioning
- [ ] Create custom components
- [ ] Performance optimization and testing

## 🎨 Theming and Branding

### Custom CSS (src/css/custom.css)

```css
:root {
  --ifm-color-primary: #2e8b57;
  --ifm-color-primary-dark: #29784c;
  --ifm-color-primary-darker: #277148;
  --ifm-color-primary-darkest: #205d3b;
  --ifm-color-primary-light: #33976e;
  --ifm-color-primary-lighter: #35a06f;
  --ifm-color-primary-lightest: #3cad76;
  --ifm-code-font-size: 95%;
}

.api-demo-panel {
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  background: var(--ifm-background-color);
}

.swagger-ui .topbar {
  display: none;
}
```

## 📊 Benefits of This Approach

### Developer Experience

- **Single Source of Truth**: All documentation in one place
- **Live Updates**: Documentation updates with code changes
- **Interactive Testing**: API explorer integrated with docs
- **Better Navigation**: Structured, searchable documentation

### Maintenance

- **Automated Builds**: Documentation builds with CI/CD
- **Version Management**: Built-in versioning support
- **Content Management**: Markdown-based, git-managed content
- **Community Contributions**: Easy for team to contribute

### Technical Advantages

- **Node.js Native**: No Python dependency
- **Modern Stack**: React-based, fast, responsive
- **SEO Optimized**: Better search engine visibility
- **Extensible**: Plugin ecosystem for additional features

## 🚀 Next Steps

1. **Initialize Docusaurus site** using the steps above
2. **Update CI/CD pipeline** to build and deploy documentation
3. **Migrate existing content** following the content plan
4. **Add OpenAPI integration** for interactive API docs
5. **Customize theming** to match project branding
6. **Train team** on documentation contribution workflow

This approach eliminates the Python dependency, provides a much better
documentation experience, and creates a solid foundation for scaling
documentation as the project grows.
