import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@moonit/ui/components/card";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/app/(auth)/login/_components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your email and password to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
