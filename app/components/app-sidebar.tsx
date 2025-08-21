import * as React from "react"
import {
  BarChart3,
  LayoutDashboard,
  HelpCircle,
  Square,
  List,
  Mail,
  Search,
  Settings,
  Users,
} from "lucide-react"
import { useRouteLoaderData } from "react-router"

import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
import { NavUser } from "~/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Campaign Outbox",
      url: "/admin/campaign-outbox",
      icon: Mail,
    },
    {
      title: "Prospects",
      url: "/admin/prospects",
      icon: Users,
    },
    {
      title: "Campaigns",
      url: "/admin/campaign",
      icon: List,
    },
    {
      title: "Landing Pages",
      url: "/admin/landingpage",
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const loaderData = useRouteLoaderData("routes/admin/_layout") as { user?: { name?: string; email?: string } } | undefined

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin">
                <Square className="!size-5" />
                <span className="text-base font-semibold">APDE FE</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: loaderData?.user?.name || "User",
          email: loaderData?.user?.email || "user@example.com",
          avatar: "",
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
