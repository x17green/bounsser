// Core type definitions for the application

export interface User {
  id: string;
  xId: string;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
  accountType?: "personal" | "organization";
  role?: "user" | "admin";
  profile?: {
    name: string;
    profile_image_url?: string;
    verified: boolean;
    followers_count?: number;
    description?: string;
  };
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  id: string;
  platform: "twitter" | "instagram" | "facebook" | "linkedin";
  username: string;
  displayName: string;
  profileImage?: string;
  isVerified: boolean;
  followerCount: number;
  connectedAt: string;
}

export interface ImpersonationEvent {
  id: string;
  suspectAccountId: string;
  suspectUsername: string;
  suspectDisplayName: string;
  suspectProfileImage?: string;
  targetAccountId: string;
  confidenceScore: number;
  status: "pending" | "confirmed" | "dismissed" | "auto_actioned";
  detectionSignals: DetectionSignal[];
  detectedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  actionTaken?: string;
}

export interface DetectionSignal {
  type:
    | "username_similarity"
    | "profile_image"
    | "bio_analysis"
    | "follower_overlap"
    | "content_similarity";
  score: number;
  details: string;
}

export interface StreamRule {
  id: string;
  type: "hashtag" | "mention" | "keyword";
  value: string;
  isActive: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type:
    | "impersonation_detected"
    | "review_required"
    | "action_taken"
    | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEventId?: string;
}

export interface AnalyticsData {
  totalDetections: number;
  confirmedImpersonations: number;
  falsePositives: number;
  averageConfidenceScore: number;
  detectionsByDay: { date: string; count: number }[];
  signalContribution: { signal: string; percentage: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// OAuth Response Types
export interface TwitterOAuthInitiateResponse {
  authUrl: string;
  codeVerifier: string;
  state: string;
}

export interface TwitterOAuthCallbackResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    xId: string;
    username: string;
    role?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
