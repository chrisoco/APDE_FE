// app/routes/login.tsx
import { Form, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { getXsrfTokenFromCookie } from "../lib/csrf";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export async function clientAction({ request }: Route.ClientActionArgs) {
  const fd = await request.formData();
  const email = String(fd.get("email") || "");
  const password = String(fd.get("password") || "");

  // 1) Get CSRF cookie
  await fetch(`${API}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });

  // 2) Read CSRF token from cookie -> header
  const xsrf = getXsrfTokenFromCookie();
  if (!xsrf) {
    return { error: "No CSRF token set. Check CORS/cookie settings." };
  }

  // 3) Attempt login (session cookie is set on success)
  const res = await fetch(`${API}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": xsrf,
    },
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) {
    return redirect("/admin");
  }

  let message = "Login failed";
  try {
    const data = await res.json();
    if (data?.message) message = data.message;
  } catch {}
  return { error: message };
}

export default function Login() {
  const actionData = useActionData<typeof clientAction>();
  const nav = useNavigation();
  const busy = nav.state === "submitting";
  const [email, setEmail] = useState("john@doe.com");
  const [password, setPassword] = useState("1234");

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {actionData?.error && (
        <p className="text-red-600">{actionData.error}</p>
      )}
      <Form method="post" className="space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} name="email" type="email" placeholder="Email" className="w-full border p-2 rounded" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} name="password" type="password" placeholder="Password" className="w-full border p-2 rounded" required />
        <button disabled={busy} className="px-4 py-2 rounded bg-blue-500 text-white">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </Form>
    </main>
  );
}
