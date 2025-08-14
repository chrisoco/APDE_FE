import { Form, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { api, apiHelpers } from "../lib/api";
import { useState } from "react";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const fd = await request.formData();
  const email = String(fd.get("email") || "");
  const password = String(fd.get("password") || "");

  try {
    await api("/sanctum/csrf-cookie", { method: "GET" });
    
    await apiHelpers.post("/login", { email, password }, { includeCSRF: true });
    
    return redirect("/admin");
  } catch (error) {
    let message = "Login failed";
    if (error instanceof Error && error.message.includes("API Error:")) {
      try {
        const errorMessage = error.message.split("API Error: ")[1];
        const data = JSON.parse(errorMessage.split(" ").slice(1).join(" "));
        if (data?.message) message = data.message;
      } catch {}
    }
    return { error: message };
  }
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
