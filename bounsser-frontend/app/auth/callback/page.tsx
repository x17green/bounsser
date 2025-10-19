"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleTwitterCallback } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const oauthError = searchParams.get("error");

        // Handle OAuth errors from Twitter
        if (oauthError) {
          throw new Error(
            oauthError === "access_denied"
              ? "You cancelled the Twitter authorization"
              : `Twitter OAuth error: ${oauthError}`,
          );
        }

        if (!code) {
          throw new Error("No authorization code received from Twitter");
        }

        // Process the callback with improved error handling
        const result = await handleTwitterCallback(code, state || undefined);

        if (result.success) {
          setStatus("success");

          // Use stored redirect URL or default to dashboard
          const redirectTo = result.redirectTo || "/dashboard";

          // Redirect after a brief success message
          setTimeout(() => {
            router.push(redirectTo);
          }, 2000);
        } else {
          throw new Error(result.error || "Authentication failed");
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setStatus("error");

        // Clear any leftover session storage on error
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("oauth_code_verifier");
          sessionStorage.removeItem("oauth_state");
          sessionStorage.removeItem("oauth_redirect");
        }
      }
    };

    processCallback();
  }, [searchParams, handleTwitterCallback, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 mx-4">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold ml-3">Bouncer</span>
        </div>

        {/* Status Content */}
        {status === "loading" && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
            <p className="text-muted-foreground">
              Please wait while we complete your Twitter login.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">
              Welcome to Bouncer!
            </h2>
            <p className="text-muted-foreground mb-4">
              You're now logged in and protected. Redirecting to your
              dashboard...
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-2000 ease-in-out"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Authentication Failed
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-transparent text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground border-t pt-4">
          <p>
            Having trouble?{" "}
            <a
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
