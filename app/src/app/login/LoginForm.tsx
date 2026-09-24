"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-8 grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        router.push("/dashboard");
      }}
    >
      <label className="grid gap-2 text-sm">
        Email
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 rounded-lg border border-black/10 bg-white px-3 outline-none focus:border-sky-500 dark:border-white/15 dark:bg-black"
        />
      </label>
      <label className="grid gap-2 text-sm">
        Password
        <input
          type="password"
          name="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 rounded-lg border border-black/10 bg-white px-3 outline-none focus:border-sky-500 dark:border-white/15 dark:bg-black"
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
