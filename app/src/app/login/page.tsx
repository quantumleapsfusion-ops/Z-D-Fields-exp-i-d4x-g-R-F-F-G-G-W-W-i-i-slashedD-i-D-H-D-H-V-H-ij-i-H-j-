import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to e1-4
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Authentication is a placeholder — any credentials continue to the
          dashboard.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
