"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";
import { IconEye, IconEyeOff, IconBrandGoogle } from "@tabler/icons-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";
import { Spinner } from "@/components/ui/spinner";
import { Loader } from "lucide-react";
import ShimmerText from "@/components/kokonutui/shimmer-text";
export function SignInForm({
  className,
  callbackUrl = "/dashboard",
  ...props
}: React.ComponentProps<"div"> & { callbackUrl?: string }) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Google sign in failed.";
      toast.error("Sign in failed", {
        description: errorMessage,
      });
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onSubmit(data: SignInInput) {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: callbackUrl,
      });
      if (error) {
        toast.error("Sign in failed", {
          description:
            error.message || "Please check your credentials and try again.",
        });
      } else {
        form.reset();
        toast.success("Welcome back!", {
          description: "You have successfully signed in.",
        });
        // Show loading state and redirect to dashboard
        setRedirecting(true);
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 500);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign in failed.";
      toast.error("Sign in failed", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {redirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-2">
            <Loader className="size-8 animate-spin" />
            <ShimmerText text="Redirecting to the dashboard..." className="text-sm relative" />
          </div>
        </div>
      )}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email and password below to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              <IconBrandGoogle className="mr-2 h-4 w-4" />
              {googleLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 mr-1 flex h-full w-8 items-center justify-center px-0"
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <IconEye className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <IconEyeOff
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={loading || redirecting}
                  className="w-full"
                >
                  {loading || redirecting ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="size-4" />
                      {redirecting ? "Redirecting..." : "Signing in..."}
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up">Sign up</Link>
                </FieldDescription>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking sign in, you agree to our{" "}
        <Link href="/terms-of-service">Terms of Service</Link> and{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
