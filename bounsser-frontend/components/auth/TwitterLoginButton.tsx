"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useState } from "react";
import { Twitter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TwitterLoginButtonProps {
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
  state?: string;
}

export default function TwitterLoginButton({
  variant = "default",
  size = "default",
  className = "",
  children,
  redirectTo,
  state,
}: TwitterLoginButtonProps) {
  const { initiateTwitterLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      // Convert relative path to full URL if needed
      let fullRedirectUrl = redirectTo;
      if (redirectTo && !redirectTo.startsWith("http")) {
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
        fullRedirectUrl = `${baseUrl}${redirectTo.startsWith("/") ? redirectTo : "/" + redirectTo}`;
      }

      await initiateTwitterLogin(state, fullRedirectUrl);
    } catch (error) {
      console.error("Twitter login error:", error);
      // Error is handled in the auth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`transition-all hover:scale-[1.02] ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Twitter className="w-4 h-4 mr-2" />
      )}
      {isLoading ? (
        <span>Connecting...</span>
      ) : (
        children || "Login with X (Twitter)"
      )}
    </Button>
  );
}
