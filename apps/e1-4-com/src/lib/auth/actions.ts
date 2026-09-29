"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const MIN_PASSWORD_LENGTH = 8;

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");
const password = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  );

function safeNextPath(next: FormDataEntryValue | null): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/";
}

type LoginMode = "signin" | "signup" | "reset";

function loginRedirect(
  mode: LoginMode,
  next: string,
  params: { error?: string; message?: string },
): never {
  const url = new URLSearchParams({ mode, next });
  if (params.error) url.set("error", params.error);
  if (params.message) url.set("message", params.message);
  redirect(`/login?${url.toString()}`);
}

function callbackUrl(next: string): string {
  const url = new URL("/auth/callback", publicEnv.siteUrl);
  url.searchParams.set("next", next);
  return url.toString();
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

export async function signInWithPassword(formData: FormData) {
  const next = safeNextPath(formData.get("next"));
  const parsed = z
    .object({ email, password: z.string().min(1, "Enter your password.") })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) loginRedirect("signin", next, { error: firstIssue(parsed.error) });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) loginRedirect("signin", next, { error: error.message });
  redirect(next);
}

export async function signUpWithEmail(formData: FormData) {
  const next = safeNextPath(formData.get("next"));
  const parsed = z
    .object({ name: z.string().trim().max(80).optional(), email, password })
    .safeParse({
      name: formData.get("name") || undefined,
      email: formData.get("email"),
      password: formData.get("password"),
    });
  if (!parsed.success) loginRedirect("signup", next, { error: firstIssue(parsed.error) });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: callbackUrl(next),
      data: parsed.data.name ? { full_name: parsed.data.name } : undefined,
    },
  });
  if (error) loginRedirect("signup", next, { error: error.message });
  if (data.session) redirect(next);
  loginRedirect("signin", next, {
    message: `Check ${parsed.data.email} for a confirmation link to finish signing up.`,
  });
}

export async function requestPasswordReset(formData: FormData) {
  const next = safeNextPath(formData.get("next"));
  const parsed = email.safeParse(formData.get("email"));
  if (!parsed.success) loginRedirect("reset", next, { error: firstIssue(parsed.error) });

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: callbackUrl("/auth/reset-password"),
  });
  if (error) loginRedirect("reset", next, { error: error.message });
  loginRedirect("signin", next, {
    message: `If ${parsed.data} has an account, a password reset link is on its way.`,
  });
}

export async function updatePassword(formData: FormData) {
  const parsed = password.safeParse(formData.get("password"));
  if (!parsed.success) {
    redirect(
      `/auth/reset-password?error=${encodeURIComponent(firstIssue(parsed.error))}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  redirect("/profile");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
