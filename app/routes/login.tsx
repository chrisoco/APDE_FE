import { redirect } from "react-router";
import type { ClientActionFunctionArgs } from "react-router";
import { api, apiHelpers } from "~/lib/api";
import { LoginForm } from "~/components/login-form";
import { hasAuthCookies } from "~/lib/csrf";

export async function clientLoader() {
    if (hasAuthCookies()) {
        try {
            const response = await api("/api/user", { method: "GET" });
            if (response.ok) {
                // User is authenticated - redirect to admin
                throw redirect("/admin");
            }
            // If response is not ok (401, 403, etc.), user is not authenticated
            // Just fall through to return null (stay on login page)
        } catch (error) {
            // Check if this is a redirect response (which we want to let through)
            if (error instanceof Response && error.status !== 401) {
                throw error;
            }
            // If API call fails, user is not authenticated - stay on login page
        }
    }
  
  return null;
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
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
      } catch (parseError) {
        // Ignore JSON parsing errors
        console.debug('Failed to parse error message as JSON:', parseError);
      }
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
