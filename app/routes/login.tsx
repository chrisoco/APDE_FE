import { redirect } from "react-router";
import type { Route } from "./+types/admin/login";
import { api, apiHelpers } from "../lib/api";
import { LoginForm } from "../components/login-form";

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
  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex flex-col items-center justify-center p-6 md:p-10">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      <div className="relative w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
