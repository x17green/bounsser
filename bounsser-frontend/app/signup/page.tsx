import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, User, Building2 } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import TwitterLoginButton from "@/components/auth/TwitterLoginButton";

export default function SignupPage() {
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
            Start protecting your accounts in minutes
          </h1>
          <div className="space-y-4">
            {[
              "Real-time impersonation detection",
              "Automated threat response",
              "Comprehensive analytics dashboard",
              "24/7 monitoring and alerts",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-primary-foreground/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-sm text-primary-foreground/60 relative z-10">
          © 2025 Bouncer. All rights reserved.
        </div>
      </div>

      {/* Right Side - Signup Form */}
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
            <h2 className="text-3xl font-bold mb-2">Create your account</h2>
            <p className="text-muted-foreground">
              Get started with Bouncer protection
            </p>
          </div>

          <div className="space-y-6">
            {/* Account Type Selection */}
            <div className="space-y-3">
              <Label>Account Type</Label>
              <RadioGroup
                defaultValue="personal"
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="personal"
                    id="personal"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="personal"
                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                  >
                    <User className="mb-3 h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Personal</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Individual account
                      </div>
                    </div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="organization"
                    id="organization"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="organization"
                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                  >
                    <Building2 className="mb-3 h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Organization</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Brand protection
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* OAuth Button */}
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
                  Or sign up with email
                </span>
              </div>
            </div>

            {/* Signup Form */}
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="h-11 transition-all focus:scale-[1.01]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="h-11 transition-all focus:scale-[1.01]"
                  />
                </div>
              </div>
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
                <Label htmlFor="password">Password</Label>
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
                Create Account
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
