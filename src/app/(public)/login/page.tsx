"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { BrandPanel } from "./components/BrandPanel";
import { OAuthProviders } from "./components/OAuthProviders";
import { login } from "@/lib/api/auth";
import { loginSchema } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateField = (field: "email" | "password", value: string) => {
    const result = loginSchema.shape[field].safeParse(value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0].message,
    }));
  };

  const loginHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fe: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fe[field]) fe[field] = issue.message;
      }
      setFieldErrors({ email: fe.email, password: fe.password });
      return;
    }

    setLoading(true);
    try {
      await login(result.data.email, result.data.password);
      router.replace(from);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed", {
        position: "top-center",
        style: { marginTop: "120px" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[6fr_4fr]">
      <BrandPanel />
      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="flex w-full max-w-md flex-col gap-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your account
            </p>
          </div>

          {/* OAuth */}
          <OAuthProviders>
            <OAuthProviders.Google />
            <OAuthProviders.More />
          </OAuthProviders>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium tracking-wider">
              OR CONTINUE WITH EMAIL
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={loginHandler}>
            <Card>
              <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>Enter your credentials</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onBlur={(e) => validateField("email", e.target.value)}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email)
                        validateField("email", e.target.value);
                    }}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby="email-error"
                  />
                  <p
                    id="email-error"
                    className="text-xs text-destructive min-h-4"
                  >
                    {fieldErrors.email ?? ""}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onBlur={(e) => validateField("password", e.target.value)}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password)
                        validateField("password", e.target.value);
                    }}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby="password-error"
                  />
                  <p
                    id="password-error"
                    className="text-xs text-destructive min-h-4"
                  >
                    {fieldErrors.password ?? ""}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </CardFooter>
            </Card>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
