---

## 🧱 1. Overview: What You’re Building

You’ll create a **dedicated documentation website** (e.g., `docs.bouncerapp.com`) powered by [**Docusaurus 3**](https://docusaurus.io/).
It will serve as:

* 🧭 Developer Guide (API usage, SDKs, examples)
* ⚙️ Internal Engineering Docs (architecture, patterns)
* 📚 Product Docs (how Bouncer’s impersonation detection works)
* 🧑‍💻 Contributor Docs (setup, deploy, contribute)

---

## 📂 2. Folder & Directory Structure

Here’s a **modular, scalable layout** for your docs workspace:

```
/bouncer-docs
├── docusaurus.config.ts
├── sidebars.ts
├── package.json
├── tsconfig.json
├── /docs
│   ├── introduction.md
│   ├── getting-started/
│   │   ├── installation.md
│   │   ├── project-structure.md
│   │   └── configuration.md
│   ├── guides/
│   │   ├── impersonation-detection.md
│   │   ├── account-monitoring.md
│   │   └── oauth-integration.md
│   ├── api/
│   │   ├── overview.md
│   │   ├── auth.md
│   │   ├── impersonation.md
│   │   ├── reports.md
│   │   └── organizations.md
│   ├── backend/
│   │   ├── architecture.md
│   │   ├── naming-conventions.md
│   │   └── database-schema.md
│   ├── frontend/
│   │   ├── nextjs-structure.md
│   │   ├── route-handlers.md
│   │   └── ui-components.md
│   ├── devops/
│   │   ├── deployment.md
│   │   ├── ci-cd.md
│   │   └── environments.md
│   ├── contributing/
│   │   ├── contribution-guidelines.md
│   │   ├── coding-standards.md
│   │   └── code-review.md
│   └── changelogs/
│       └── v1.0.0.md
├── /versioned_docs/
│   ├── version-1.0/
│   ├── version-1.1/
│   └── ...
└── /static
    ├── images/
    ├── diagrams/
    └── swagger/
```

---

## 🧭 3. Sidebar Configuration (`sidebars.ts`)

Here’s how you can define a **clean and intuitive navigation**:

```ts
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsible: false,
      items: [
        'getting-started/installation',
        'getting-started/project-structure',
        'getting-started/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/impersonation-detection',
        'guides/account-monitoring',
        'guides/oauth-integration',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/overview',
        'api/auth',
        'api/impersonation',
        'api/reports',
        'api/organizations',
      ],
    },
    {
      type: 'category',
      label: 'System Design',
      items: [
        'backend/architecture',
        'backend/naming-conventions',
        'backend/database-schema',
        'frontend/nextjs-structure',
        'frontend/route-handlers',
        'frontend/ui-components',
      ],
    },
    {
      type: 'category',
      label: 'DevOps & CI/CD',
      items: [
        'devops/deployment',
        'devops/ci-cd',
        'devops/environments',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: [
        'contributing/contribution-guidelines',
        'contributing/coding-standards',
        'contributing/code-review',
      ],
    },
    {
      type: 'category',
      label: 'Changelogs',
      items: ['changelogs/v1.0.0'],
    },
  ],
};

export default sidebars;
```

---

## 🔢 4. Versioning Setup

Docusaurus supports **versioned documentation** out of the box.

### Commands:

```bash
npx docusaurus docs:version 1.0
```

This creates:

```bash
/versioned_docs/version-1.0
/versioned_sidebars/version-1.0-sidebars.json
```

You can later create v1.1, v2.0, etc., and host older docs easily.

---

## 🧩 5. Markdown Templates (Examples)

### 🧠 Example 1: `docs/getting-started/installation.md`

```md
---
title: Installation
sidebar_position: 1
---

# 🧰 Installation Guide

Follow these steps to set up **Bouncer** locally.

## Prerequisites
- Node.js 20+
- PostgreSQL 15+
- PNPM (recommended)

## Setup
```bash
git clone https://github.com/astromania/bouncer.git
cd bouncer
pnpm install
```

Configure your `.env`:

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
TWITTER_API_KEY="..."
```

Then run:

```bash
pnpm dev
```

---

### ⚙️ Example 2: `docs/api/auth.md`

```md
---
title: Authentication API
---

# 🔐 Authentication Endpoints

## `POST /api/v1/auth/login`
Authenticate a user via email/password.

**Request**
```json
{
  "email": "user@example.com",
  "password": "********"
}
```

**Response**

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## `GET /api/v1/auth/twitter`

Initiate OAuth flow with Twitter.

## `GET /api/v1/auth/me`

Returns the authenticated user's profile.

---

### 🧠 Example 3: `docs/backend/architecture.md`
```md
---
title: Backend Architecture
---

# 🧩 Backend Architecture

The **Bouncer Backend** is built with:
- Node.js + Express + TypeScript
- PostgreSQL (via Prisma ORM)
- Redis (for caching)
- Socket.IO (for real-time notifications)

## Structure Overview

```bash
backend/
├── src/
│   ├── api/
│   ├── services/
│   ├── utils/
│   ├── middlewares/
│   ├── prisma/
│   └── server.ts
```

Each module follows **class-based service architecture**, enforcing strong typing and modular boundaries.

---

## ⚡ 6. Theming and Branding

In `docusaurus.config.ts`:
```ts
themeConfig: {
  navbar: {
    title: 'Bouncer Docs',
    logo: { alt: 'Bouncer Logo', src: 'img/logo.svg' },
    items: [
      { to: '/docs/getting-started/installation', label: 'Docs', position: 'left' },
      { href: 'https://github.com/astromania/bouncer', label: 'GitHub', position: 'right' },
    ],
  },
  footer: {
    style: 'dark',
    links: [
      {
        title: 'Docs',
        items: [{ label: 'API Reference', to: '/docs/api/overview' }],
      },
      {
        title: 'Community',
        items: [
          { label: 'Twitter', href: 'https://twitter.com/astromania' },
          { label: 'GitHub', href: 'https://github.com/astromania/bouncer' },
        ],
      },
    ],
    copyright: `© ${new Date().getFullYear()} AstroMANIA Enterprise.`,
  },
}
```

---

## 🛠️ 7. Deployment & Hosting

| Platform             | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| **Vercel**           | Simple deployment from GitHub (free tier works great) |
| **Cloudflare Pages** | Fast, global CDN, free SSL                            |
| **Netlify**          | Alternative with CI/CD hooks                          |
| **GitHub Pages**     | If you want a public open-source doc                  |

### Deployment Command:

```bash
npm run build
npm run serve
```

or

```bash
vercel --prod
```

---

## 🧠 8. Automation & Maintenance

* Add a **GitHub Action** to auto-deploy docs on every main branch merge.
* Auto-generate OpenAPI JSON and embed it in `/docs/api/overview.md`.
* Keep a `CHANGELOG.md` synced with `/docs/changelogs/`.

---

## 🏁 Final Developer Experience

* **Visit:** `https://docs.bouncerapp.com`
* **Interactive API Docs:** `/docs/api/overview`
* **Version switcher:** top-right dropdown (v1.0, v1.1, etc.)
* **Fully searchable, themed, and responsive documentation portal**

---
