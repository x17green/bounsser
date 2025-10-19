# ADR-003: Path Aliases for Clean Imports

## Status

Accepted

## Date

2024-01-15

## Context

As the Bouncer backend codebase grows, we need a strategy for managing import
statements across modules. The project has a modular architecture with separate
directories for core functionality, modules, database access, workers, and
shared utilities. Without proper import management, we encounter several issues:

- **Relative Import Hell**: Deep nested imports like
  `../../../modules/shared/utils/logger`
- **Refactoring Difficulty**: Moving files requires updating numerous relative
  import paths
- **Poor Readability**: Long relative paths make code harder to read and
  understand
- **Import Inconsistency**: Different developers using different import styles
- **IDE Support**: Poor autocomplete and navigation with complex relative paths

### Current Directory Structure

```
src/
├── core/
│   ├── middleware/
│   ├── routes/
│   ├── config/
│   └── ...
├── modules/
│   ├── user/
│   ├── org/
│   ├── ingest/
│   ├── monitoring/
│   └── shared/
│       ├── types/
│       ├── utils/
│       └── ...
├── db/
├── workers/
└── ...
```

### Requirements

- **Clean Imports**: Short, readable import statements
- **Refactoring Safety**: Moving files shouldn't break imports
- **IDE Support**: Excellent autocomplete and "go to definition"
- **Consistency**: Uniform import style across the codebase
- **TypeScript Compatibility**: Full TypeScript support with proper type
  resolution
- **Build Compatibility**: Work with both development (tsx) and production
  builds

### Alternatives Considered

#### 1. Relative Imports Only

**Example:**

```typescript
import { logger } from '../../../modules/shared/utils/logger';
import { UserService } from '../../modules/user/user.service';
```

**Pros:**

- No additional configuration required
- Explicit path relationships
- Standard JavaScript/TypeScript approach

**Cons:**

- Becomes unreadable with deep nesting
- Difficult to refactor when moving files
- Inconsistent import lengths
- Poor developer experience
- Hard to remember exact relative paths

#### 2. Node.js Package-style Imports

**Example:**

```typescript
import { logger } from 'bouncer-backend/shared/utils/logger';
import { UserService } from 'bouncer-backend/modules/user/user.service';
```

**Pros:**

- Consistent import style
- Easy to understand module boundaries

**Cons:**

- Requires complex module resolution configuration
- Not standard for internal modules
- Potential conflicts with actual npm packages
- Additional build complexity

#### 3. Barrel Exports with Index Files

**Example:**

```typescript
// src/modules/shared/index.ts
export * from './utils/logger';
export * from './types/errors';

// Usage
import { logger, AuthenticationError } from '../shared';
```

**Pros:**

- Clean imports for exported items
- Explicit public API for modules
- Good for library-style architecture

**Cons:**

- Requires maintaining many index files
- Can create circular dependency issues
- Build performance impact with large barrel files
- Still requires relative imports to reach barrel files

#### 4. TypeScript Path Aliases

**Example:**

```typescript
import { logger } from '@/shared/utils/logger';
import { UserService } from '@/modules/user/user.service';
import { authMiddleware } from '@/core/middleware/auth';
```

**Pros:**

- Clean, consistent import syntax
- Excellent IDE support with proper configuration
- Easy refactoring - moving files doesn't break imports to them
- TypeScript native support
- Configurable and flexible
- Works well with both development and build tools

**Cons:**

- Requires configuration in multiple places (tsconfig.json, build tools)
- Can be confusing for developers unfamiliar with the pattern
- Need to ensure build tools support the aliases

## Decision

We will use **TypeScript Path Aliases** with the `@/` prefix for all internal
imports.

### Alias Configuration

```typescript
// tsconfig.json paths configuration
{
  "baseUrl": "./src",
  "paths": {
    "@/*": ["*"],
    "@/core/*": ["core/*"],
    "@/modules/*": ["modules/*"],
    "@/db/*": ["db/*"],
    "@/workers/*": ["workers/*"],
    "@/shared/*": ["modules/shared/*"],
    "@/types/*": ["modules/shared/types/*"],
    "@/utils/*": ["modules/shared/utils/*"],
    "@/config/*": ["core/config/*"],
    "@/middleware/*": ["core/middleware/*"]
  }
}
```

### Key Factors

1. **Developer Experience**: Significantly improves code readability and
   maintainability
2. **IDE Support**: Excellent autocomplete and navigation with proper VS Code
   configuration
3. **Refactoring Safety**: Moving files doesn't break imports that reference
   them
4. **Consistency**: Uniform import style across the entire codebase
5. **TypeScript Native**: Built-in TypeScript feature with no runtime overhead
6. **Tool Ecosystem**: Well-supported by build tools (tsc-alias, webpack, etc.)

## Implementation Details

### Import Conventions

```typescript
// ✅ Good - Use aliases for internal modules
import { logger } from '@/shared/utils/logger';
import { UserController } from '@/modules/user/user.controller';
import { authMiddleware } from '@/core/middleware/auth';
import { prisma } from '@/db';

// ✅ Good - Use normal imports for external packages
import express from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// ❌ Bad - Don't mix relative and alias imports
import { logger } from '../shared/utils/logger';
import { UserService } from '@/modules/user/user.service';

// ❌ Bad - Don't use aliases for external packages
import express from '@/express';
```

### Build Configuration

- **Development**: tsx handles path resolution automatically with tsconfig.json
- **Production**: tsc-alias transforms aliases to relative paths after
  TypeScript compilation
- **Testing**: Jest configured to resolve aliases using moduleNameMapper

### IDE Configuration (VS Code)

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "path-intellisense.mappings": {
    "@": "${workspaceRoot}/src",
    "@/core": "${workspaceRoot}/src/core",
    "@/modules": "${workspaceRoot}/src/modules"
    // ... other mappings
  }
}
```

## Consequences

### Positive

- **Improved Readability**: Import statements are concise and self-documenting
- **Better Refactoring**: Moving files is safer and easier
- **Consistent Style**: Uniform import patterns across the codebase
- **Enhanced IDE Experience**: Better autocomplete and navigation
- **Reduced Cognitive Load**: Developers don't need to calculate relative paths
- **Future-Proof**: Easy to restructure directories without breaking imports

### Negative

- **Learning Curve**: New developers need to understand the alias system
- **Configuration Overhead**: Requires setup in multiple tools (TypeScript,
  build tools, IDE, tests)
- **Build Tool Dependency**: Relies on tsc-alias or similar tools for production
  builds
- **Potential Confusion**: Mixing relative and alias imports can be confusing

### Mitigation Strategies

1. **Documentation**: Clear guidelines in development documentation
2. **Linting Rules**: ESLint rules to enforce consistent import patterns
3. **IDE Configuration**: Provide VS Code configuration for all developers
4. **Code Reviews**: Ensure consistency during code review process
5. **Onboarding**: Include alias system in developer onboarding materials

## Usage Guidelines

### When to Use Aliases

- ✅ All imports from `src/` directory
- ✅ Cross-module imports (user → shared, core → modules)
- ✅ Imports going "up" the directory tree

### When to Use Relative Imports

- ✅ Imports within the same directory
- ✅ Imports to immediate siblings (same parent directory)
- ✅ Test files importing the file they're testing

### Examples

```typescript
// In src/modules/user/user.controller.ts

// ✅ Good - Use alias for shared utilities
import { logger } from '@/shared/utils/logger';
import { ValidationError } from '@/shared/types/errors';

// ✅ Good - Use relative for same directory
import { UserService } from './user.service';
import { userValidation } from './user.validation';

// ✅ Good - Use alias for core middleware
import { authMiddleware } from '@/core/middleware/auth';
```

## Tooling Requirements

- **TypeScript**: 4.0+ for proper path mapping support
- **tsc-alias**: For transforming aliases in production builds
- **VS Code**: Path Intellisense extension for autocomplete
- **ESLint**: Rules for import consistency (future enhancement)

## References

- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [tsc-alias Documentation](https://github.com/justkey007/tsc-alias)
- [VS Code Path Mapping](https://code.visualstudio.com/docs/languages/jsconfig#_path-mapping)

## Review Date

2024-07-15 (6 months from decision date)
