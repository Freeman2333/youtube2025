"use client";

import { Home, Rss, Clock, Heart, List, FlameIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  auth?: boolean;
};

const mainItems: SidebarItem[] = [
  { label: "Home", href: "/", icon: <Home /> },
  {
    label: "Subscriptions",
    href: "feed/subscriptions",
    icon: <Rss />,
    auth: true,
  },
  { label: "Trending", href: "/trending", icon: <FlameIcon /> },
];

const youItems: SidebarItem[] = [
  { label: "History", href: "/history", icon: <Clock /> },
  { label: "Liked Videos", href: "/liked", icon: <Heart /> },
  { label: "All Playlists", href: "/playlists", icon: <List /> },
];

export const HomeSidebar = () => {
  const { state } = useSidebar();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarContent className="pt-16 bg-white">
        {/* Explore group */}
        <SidebarGroup>
          <SidebarMenu>
            {mainItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2",
                        isActive &&
                          "font-semibold bg-gray-100 rounded-md px-2 py-1"
                      )}
                    >
                      {item.icon}
                      <span className={state === "collapsed" ? "hidden" : ""}>
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        {/* You group */}
        <SidebarGroup>
          <SidebarGroupLabel>You</SidebarGroupLabel>
          <SidebarMenu>
            {youItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <Link href={item.href} className="flex items-center gap-2">
                    {item.icon}
                    <span className={state === "collapsed" ? "hidden" : ""}>
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
