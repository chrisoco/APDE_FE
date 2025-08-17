import { redirect } from "react-router";
import type { Route } from "./+types/login";
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
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
