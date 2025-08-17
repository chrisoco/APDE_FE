import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { NavLink } from "react-router"

import { Button } from "~/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <NavLink
                to={item.url}
                end={item.url === "/admin"}
              >
                {({ isActive }) => (
                  <SidebarMenuButton 
                    tooltip={item.title}
                    className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
