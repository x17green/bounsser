import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import TwitterLoginButton from "@/components/auth/TwitterLoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <AnimatedBackground />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-secondary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="flex items-center gap-2 text-primary-foreground relative z-10 animate-fade-in-up">
          <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">Bouncer</span>
        </div>
        <div
          className="space-y-6 text-primary-foreground relative z-10 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-4xl font-bold text-balance">
            Protect your brand from impersonation attacks
          </h1>
          <p className="text-lg text-primary-foreground/80 text-pretty">
            Real-time monitoring and AI-powered detection to keep your social
            media presence secure.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-primary-foreground/20 border-2 border-primary flex items-center justify-center text-xs font-semibold"
                >
                  {i}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="font-semibold">50,000+ accounts protected</div>
              <div className="text-primary-foreground/70">
                Trusted by brands worldwide
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-primary-foreground/60 relative z-10">
          © 2025 Bouncer. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div
          className="w-full max-w-md space-y-8 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Bouncer</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <div className="space-y-4">
            {/* OAuth Buttons */}
            <TwitterLoginButton
              variant="outline"
              size="lg"
              className="w-full bg-transparent"
              redirectTo="/dashboard"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 transition-all focus:scale-[1.01]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 transition-all focus:scale-[1.01]"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
              >
                Sign In
              </Button>
            </form>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
