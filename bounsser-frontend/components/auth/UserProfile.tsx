"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  LogOut,
  Building2,
  Shield,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface UserProfileProps {
  showDropdown?: boolean;
  className?: string;
}

export default function UserProfile({
  showDropdown = true,
  className = "",
}: UserProfileProps) {
  const { user, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitials = user.username
    ? user.username.substring(0, 2).toUpperCase()
    : user.profile?.name
      ? user.profile.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "U";

  const displayName = user.profile?.name || user.username || "User";
  const profileImage = user.profile?.profile_image_url || user.avatar;

  if (!showDropdown) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Avatar className="w-8 h-8">
          <AvatarImage src={profileImage} alt={displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">
            @{user.username}
          </span>
        </div>
        {user.profile?.verified && (
          <Shield className="w-4 h-4 text-blue-500" title="Verified Account" />
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center space-x-2 h-auto p-2 hover:bg-accent/50 ${className}`}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              @{user.username}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{displayName}</span>
              {user.profile?.verified && (
                <Shield className="w-3 h-3 text-blue-500" />
              )}
            </div>
            <span className="text-xs text-muted-foreground font-normal">
              @{user.username}
            </span>
            {user.profile?.followers_count && (
              <span className="text-xs text-muted-foreground font-normal">
                {user.profile.followers_count.toLocaleString()} followers
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>

        {user.accountType === "organization" && (
          <DropdownMenuItem asChild>
            <Link href="/org/dashboard" className="cursor-pointer">
              <Building2 className="w-4 h-4 mr-2" />
              Organization
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 mr-2" />
          )}
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
