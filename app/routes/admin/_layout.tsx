import * as React from "react";
import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/_layout";
import { apiHelpers } from "~/lib/api";
import { clearAuthCookies } from "~/lib/csrf";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";

export async function clientLoader() {
  try {
    const user = await apiHelpers.get("/api/user");
    return { user };
  } catch {
    throw redirect("/admin/login");
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    try {
      await apiHelpers.post("/logout", {}, {
        requiresAuth: true,
        includeCSRF: true
      });
    } catch (error) {
      // Even if logout fails, redirect to login
      console.warn("Logout failed:", error);
    }
    
    // Clear client-side auth cookies
    clearAuthCookies();
    
    return redirect("/admin/login");
  }

  return null;
}

export default function AdminLayout() {
  useLoaderData<typeof clientLoader>();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="px-4 lg:px-6">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

