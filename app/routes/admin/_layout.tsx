import * as React from "react";
import { Outlet, redirect, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/_layout";
import { apiHelpers } from "~/lib/api";
import { clearAuthCookies } from "~/lib/csrf";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { LoadingBoundary } from "~/components/ui/loading-boundary";
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
  const navigation = useNavigation();
  
  const isNavigating = navigation.state === "loading";

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
              <main className="px-4 lg:px-6 relative">
                {isNavigating && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-start justify-center pt-8">
                    <div className="flex items-center space-x-2 bg-background border rounded-md px-4 py-2 shadow-sm">
                      <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  </div>
                )}
                <LoadingBoundary>
                  <Outlet />
                </LoadingBoundary>
              </main>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

