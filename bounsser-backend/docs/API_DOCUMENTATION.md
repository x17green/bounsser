# Bouncer Backend API Documentation

> **Version:** 1.0.0  
> **Last Updated:** January 15, 2024  
> **Base URL:** `https://api.bouncer.example.com/api/v1`

## Overview

The Bouncer Backend API provides endpoints for managing Twitter/X account
impersonation detection and monitoring. The API is RESTful, uses JSON for data
exchange, and implements JWT-based authentication for secure access.

### Key Features

- **Twitter OAuth 2.0 Integration** - Secure user authentication via Twitter
- **Real-time Impersonation Detection** - AI-powered detection of suspicious
  accounts
- **Webhook Support** - Real-time notifications from Twitter
- **Comprehensive Analytics** - Detailed statistics and trend analysis
- **GDPR Compliance** - Data export and privacy controls
- **Multi-tenant Support** - Organization and team management

### Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a
valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": object | array | null,
  "message": string,
  "error": string (only if success is false)
}
```

### Rate Limiting

Rate limits are applied per IP address and authenticated user:

- **Standard API Endpoints**: 100 requests per 15 minutes
- **Authentication Endpoints**: 10 requests per 15 minutes
- **Sensitive Operations**: 3 requests per hour

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

---

## Authentication Endpoints

### Initiate Twitter OAuth Flow

**`GET /auth/twitter`**

Generates a Twitter OAuth authorization URL for user authentication.

**Query Parameters:**

- `state` (string, optional) - CSRF protection state parameter
- `redirect` (string, optional) - Post-authentication redirect URL

**Response:**

```json
{
  "success": true,
  "data": {
    "authUrl": "https://twitter.com/i/oauth2/authorize?...",
    "codeVerifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
    "state": "csrf-token"
  },
  "message": "Twitter OAuth URL generated successfully"
}
```

### Handle Twitter OAuth Callback

**`POST /auth/twitter/callback`**

Processes Twitter OAuth callback and authenticates the user.

**Query Parameters:**

- `code` (string, required) - Authorization code from Twitter
- `state` (string, optional) - State parameter for verification

**Request Body:**

```json
{
  "codeVerifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "xId": "1234567890",
      "username": "johndoe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  },
  "message": "Authentication successful"
}
```

### Refresh JWT Tokens

**`POST /auth/refresh`**

Refreshes access and refresh tokens using a valid refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  },
  "message": "Tokens refreshed successfully"
}
```

### Logout User

**`POST /auth/logout`**

Invalidates user's authentication tokens.

**Headers:**

- `Authorization: Bearer <token>` (optional)

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

**`GET /auth/me`**

Returns current authenticated user information.

**Headers:**

- `Authorization: Bearer <token>` (optional)

**Response (authenticated):**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "xId": "1234567890",
    "username": "johndoe",
    "role": "user"
  },
  "message": "User authenticated"
}
```

**Response (not authenticated):**

```json
{
  "success": true,
  "data": null,
  "message": "Not authenticated"
}
```

### Verify JWT Token

**`POST /auth/verify`**

Validates a JWT token without exposing payload information.

**Request Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "valid": true
  },
  "message": "Token is valid"
}
```

### Get Authentication Status

**`GET /auth/status`**

Returns authentication system status and configuration.

**Response:**

```json
{
  "success": true,
  "data": {
    "twitterOAuth": {
      "enabled": true
    },
    "jwt": {
      "enabled": true
    },
    "rateLimit": {
      "authWindow": 15,
      "authMax": 10,
      "strictWindow": 60,
      "strictMax": 3
    },
    "environment": "production",
    "version": "1.0.0"
  },
  "message": "Authentication system status"
}
```

---

## User Management Endpoints

All user endpoints require authentication via `Authorization: Bearer <token>`
header.

### Get User Profile

**`GET /users/profile`** 🔒

Retrieves the authenticated user's complete profile information.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "xId": "1234567890",
    "username": "johndoe",
    "displayName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "subscription": {
      "plan": "premium",
      "status": "active"
    },
    "twitterIntegration": {
      "connected": true,
      "lastSync": "2024-01-15T10:30:00Z"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Profile retrieved successfully"
}
```

### Update User Profile

**`PUT /users/profile`** 🔒

Updates user profile information.

**Request Body:**

```json
{
  "displayName": "John Smith",
  "email": "john.smith@example.com",
  "preferences": {
    "theme": "dark",
    "language": "en"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "displayName": "John Smith",
    "email": "john.smith@example.com",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

### Delete User Account

**`DELETE /users/profile`** 🔒⚠️

Permanently deletes the user account and all associated data.

**Request Body:**

```json
{
  "confirmation": "DELETE_MY_ACCOUNT",
  "reason": "No longer using the service"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### Get User Settings

**`GET /users/settings`** 🔒

Retrieves user settings and preferences.

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": {
      "email": true,
      "impersonationAlerts": true,
      "weeklyReports": false
    },
    "privacy": {
      "profileVisibility": "private",
      "dataSharing": false
    },
    "monitoring": {
      "autoDetection": true,
      "sensitivityLevel": "medium"
    },
    "ui": {
      "theme": "dark",
      "language": "en"
    }
  },
  "message": "Settings retrieved successfully"
}
```

### Update User Settings

**`PUT /users/settings`** 🔒

Updates user settings and preferences.

**Request Body:**

```json
{
  "notifications": {
    "email": false,
    "impersonationAlerts": true
  },
  "ui": {
    "theme": "light"
  }
}
```

---

## Twitter Integration Endpoints

### Get Twitter Profile

**`GET /users/twitter/profile`** 🔒

Retrieves user's Twitter profile information.

**Response:**

```json
{
  "success": true,
  "data": {
    "xId": "1234567890",
    "username": "johndoe",
    "displayName": "John Doe",
    "profileImageUrl": "https://pbs.twimg.com/profile_images/...",
    "followersCount": 1250,
    "followingCount": 400,
    "verified": false,
    "lastSync": "2024-01-15T10:30:00Z"
  },
  "message": "Twitter profile retrieved successfully"
}
```

### Refresh Twitter Tokens

**`POST /users/twitter/refresh`** 🔒

Refreshes Twitter API access tokens.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "refreshed",
    "lastRefresh": "2024-01-15T12:00:00Z"
  },
  "message": "Twitter tokens refreshed successfully"
}
```

### Disconnect Twitter Account

**`DELETE /users/twitter/disconnect`** 🔒⚠️

Disconnects Twitter account integration.

**Response:**

```json
{
  "success": true,
  "message": "Twitter account disconnected successfully"
}
```

---

## Events and Reports Endpoints

### Get User Events

**`GET /users/events`** 🔒

Retrieves impersonation detection events.

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Events per page
- `status` (string) - Filter by status (pending, confirmed, dismissed)
- `dateFrom` (string) - Filter from date (ISO string)
- `dateTo` (string) - Filter to date (ISO string)

**Response:**

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event_123",
        "type": "impersonation_detected",
        "status": "pending",
        "suspiciousAccount": {
          "username": "john_doe_fake",
          "profileSimilarity": 0.85
        },
        "detectedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  },
  "message": "Events retrieved successfully"
}
```

### Get Event Details

**`GET /users/events/:eventId`** 🔒

Retrieves detailed information about a specific event.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "event_123",
    "type": "impersonation_detected",
    "status": "pending",
    "suspiciousAccount": {
      "username": "john_doe_fake",
      "displayName": "John Doe",
      "profileImageUrl": "https://...",
      "profileSimilarity": 0.85
    },
    "analysis": {
      "textSimilarity": 0.92,
      "imageSimilarity": 0.78,
      "behaviorScore": 0.65,
      "riskLevel": "high"
    },
    "evidence": [
      {
        "type": "profile_text",
        "similarity": 0.92,
        "description": "Bio text matches 92% with original"
      }
    ],
    "detectedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Event details retrieved successfully"
}
```

### Review Event

**`PATCH /users/events/:eventId/review`** 🔒

Reviews and updates event status.

**Request Body:**

```json
{
  "status": "confirmed",
  "feedback": "Definitely an impersonation attempt",
  "actions": ["reported", "blocked"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "event_123",
    "status": "confirmed",
    "reviewedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Event reviewed successfully"
}
```

### Create Report

**`POST /users/reports`** 🔒

Creates a manual impersonation report.

**Request Body:**

```json
{
  "suspiciousUsername": "fake_john_doe",
  "reason": "profile_impersonation",
  "description": "This account is using my profile picture and bio",
  "evidence": ["https://twitter.com/fake_john_doe"],
  "priority": "high"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "report_456",
    "status": "submitted",
    "createdAt": "2024-01-15T11:30:00Z"
  },
  "message": "Report created successfully"
}
```

### Get User Reports

**`GET /users/reports`** 🔒

Retrieves user's submitted reports.

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Reports per page
- `status` (string) - Filter by status

**Response:**

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_456",
        "suspiciousUsername": "fake_john_doe",
        "reason": "profile_impersonation",
        "status": "under_review",
        "priority": "high",
        "createdAt": "2024-01-15T11:30:00Z",
        "updatedAt": "2024-01-15T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  },
  "message": "Reports retrieved successfully"
}
```

---

## Analytics Endpoints

### Get User Statistics

**`GET /users/stats`** 🔒

Retrieves user account statistics and summary.

**Response:**

```json
{
  "success": true,
  "data": {
    "events": {
      "total": 15,
      "confirmed": 8,
      "dismissed": 5,
      "pending": 2
    },
    "reports": {
      "submitted": 3,
      "resolved": 2
    },
    "protection": {
      "threatsBlocked": 8,
      "lastScan": "2024-01-15T10:00:00Z"
    }
  },
  "message": "Statistics retrieved successfully"
}
```

### Get User Analytics

**`GET /users/analytics`** 🔒

Retrieves detailed analytics and trends.

**Query Parameters:**

- `period` (string, default: '30d') - Time period ('7d', '30d', '90d', '1y')
- `metric` (string) - Specific metric to retrieve
- `granularity` (string, default: 'day') - Data granularity ('hour', 'day',
  'week', 'month')

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEvents": 25,
      "averagePerDay": 0.83,
      "threatReduction": 0.15
    },
    "timeSeries": [
      {
        "date": "2024-01-01",
        "events": 2,
        "confirmed": 1
      }
    ],
    "trends": {
      "direction": "decreasing",
      "changePercent": -15.2
    },
    "topThreats": [
      {
        "type": "profile_impersonation",
        "count": 12,
        "percentage": 48
      }
    ]
  },
  "message": "Analytics retrieved successfully"
}
```

---

## Notification Endpoints

### Get Notifications

**`GET /users/notifications`** 🔒

Retrieves user notifications.

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Notifications per page
- `unreadOnly` (boolean, default: false) - Show only unread notifications

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "impersonation_detected",
        "title": "New impersonation detected",
        "message": "A suspicious account matching your profile has been detected",
        "read": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    },
    "unreadCount": 3
  },
  "message": "Notifications retrieved successfully"
}
```

### Mark Notification as Read

**`PATCH /users/notifications/:notificationId/read`** 🔒

Marks a specific notification as read.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "notif_123",
    "read": true,
    "readAt": "2024-01-15T11:45:00Z"
  },
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read

**`PATCH /users/notifications/read-all`** 🔒

Marks all notifications as read.

**Response:**

```json
{
  "success": true,
  "data": {
    "updatedCount": 5,
    "updatedAt": "2024-01-15T11:45:00Z"
  },
  "message": "All notifications marked as read"
}
```

---

## Session Management Endpoints

### Get User Sessions

**`GET /users/sessions`** 🔒

Retrieves active user sessions.

**Response:**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_123",
        "deviceType": "desktop",
        "browser": "Chrome 120.0.0",
        "os": "Windows 11",
        "ipAddress": "192.168.1.100",
        "location": "New York, NY",
        "createdAt": "2024-01-15T09:00:00Z",
        "lastActivity": "2024-01-15T11:30:00Z",
        "current": true
      }
    ],
    "currentSessionId": "session_123"
  },
  "message": "Sessions retrieved successfully"
}
```

### Revoke Session

**`DELETE /users/sessions/:sessionId`** 🔒

Revokes a specific user session.

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "session_456",
    "revokedAt": "2024-01-15T12:00:00Z"
  },
  "message": "Session revoked successfully"
}
```

### Revoke All Sessions

**`DELETE /users/sessions`** 🔒⚠️

Revokes all sessions except the current one.

**Response:**

```json
{
  "success": true,
  "data": {
    "revokedCount": 3,
    "revokedAt": "2024-01-15T12:00:00Z"
  },
  "message": "All other sessions revoked successfully"
}
```

---

## Data Export Endpoints

### Request Data Export

**`POST /users/export`** 🔒⚠️

Requests user data export for GDPR compliance.

**Request Body:**

```json
{
  "dataTypes": ["profile", "events", "reports"],
  "format": "json",
  "includeDeleted": false,
  "dateFrom": "2024-01-01T00:00:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "exportId": "export_789",
    "status": "pending",
    "estimatedCompletion": "2024-01-15T13:00:00Z",
    "requestedAt": "2024-01-15T12:00:00Z"
  },
  "message": "Data export request submitted successfully"
}
```

---

## System Endpoints

### Health Check

**`GET /health`**

Returns application health status.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T12:00:00Z",
    "uptime": 86400,
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "twitter_api": "healthy"
    }
  },
  "message": "System is healthy"
}
```

### Application Metrics

**`GET /metrics`**

Returns Prometheus-formatted application metrics.

**Response:** Plain text Prometheus metrics format

---

## Webhook Endpoints

### Twitter Webhook

**`POST /webhooks/twitter`**

Receives Twitter webhook notifications.

**Headers:**

- `X-Twitter-Webhooks-Signature` - Twitter signature for validation

**Request Body:** Twitter webhook payload (varies by event type)

**Response:**

```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

### Webhook Challenge

**`GET /webhooks/twitter`**

Responds to Twitter webhook challenge during setup.

**Query Parameters:**

- `crc_token` (string, required) - Challenge token from Twitter

**Response:**

```json
{
  "response_token": "sha256=<calculated_response>"
}
```

---

## Error Codes

### HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict
- **422 Unprocessable Entity** - Validation failed
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error
- **502 Bad Gateway** - External service error
- **503 Service Unavailable** - Service temporarily unavailable

### Error Response Format

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "The provided email address is invalid",
  "details": {
    "field": "email",
    "code": "INVALID_FORMAT"
  }
}
```

### Common Error Types

- **ValidationError** - Request validation failed
- **AuthenticationError** - Authentication failed or token invalid
- **AuthorizationError** - Insufficient permissions
- **NotFoundError** - Requested resource not found
- **ConflictError** - Resource already exists or conflict
- **RateLimitError** - Rate limit exceeded
- **ExternalServiceError** - External service (Twitter API) error
- **InternalError** - Internal server error

---

## Rate Limiting Details

### Rate Limit Types

1. **Authentication Endpoints** - 10 requests per 15 minutes
2. **Standard API Endpoints** - 100 requests per 15 minutes
3. **Sensitive Operations** - 3 requests per hour

### Rate Limit Headers

All responses include rate limiting information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642347600
X-RateLimit-Window: 900
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "TooManyRequests",
  "message": "Rate limit exceeded. Try again in 15 minutes.",
  "retryAfter": 900
}
```

---

## SDKs and Libraries

### Official SDKs

- **JavaScript/TypeScript** - `@bouncer/api-client` (coming soon)
- **Python** - `bouncer-python` (coming soon)

### Third-party Libraries

- **Postman Collection** - Available in the repository
- **OpenAPI Specification** - Generated from code documentation

---

## Support and Resources

- **API Status Page**: https://status.bouncer.example.com
- **Developer Portal**: https://developers.bouncer.example.com
- **GitHub Repository**: https://github.com/x17green/bouncer-backend
- **Support Email**: api-support@bouncer.example.com

---

## Changelog

### Version 1.0.0 (2024-01-15)

- Initial API release
- Twitter OAuth 2.0 integration
- Basic impersonation detection
- User management endpoints
- GDPR compliance features

---

**Legend:**

- 🔒 Authentication required
- ⚠️ Strict rate limiting applied
