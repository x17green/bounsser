// Application constants

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DEMO: "/demo",
  PRICING: "/pricing",
  ABOUT: "/about",
  BLOG: "/blog",
  CONTACT: "/contact",
  DOCUMENTATION: "/docs",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  SECURITY: "/security",

  // Dashboard routes
  DASHBOARD: "/dashboard",
  EVENTS: "/dashboard/events",
  FLAGS: "/dashboard/flags",
  NOTIFICATIONS: "/dashboard/notifications",
  SETTINGS: "/dashboard/settings",

  // Organization routes
  ORG_DASHBOARD: "/org/dashboard",
  ORG_ACCOUNTS: "/org/accounts",
  ORG_RULES: "/org/rules",
  ORG_EVENTS: "/org/events",
  ORG_REPORTS: "/org/reports",
  ORG_TEAM: "/org/team",

  // Other routes
  REVIEW: "/review",
  ANALYTICS: "/analytics",
  SUSPECT: (id: string) => `/suspect/${id}`,
} as const;

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
  LOW: 0.3,
} as const;

export const DETECTION_SIGNALS = {
  USERNAME_SIMILARITY: "username_similarity",
  PROFILE_IMAGE: "profile_image",
  BIO_ANALYSIS: "bio_analysis",
  FOLLOWER_OVERLAP: "follower_overlap",
  CONTENT_SIMILARITY: "content_similarity",
} as const;

export const PLATFORMS = {
  TWITTER: "twitter",
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  LINKEDIN: "linkedin",
} as const;

export const EVENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DISMISSED: "dismissed",
  AUTO_ACTIONED: "auto_actioned",
} as const;
