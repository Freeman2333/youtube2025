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
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";

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
  { label: "History", href: "/history", icon: <Clock />, auth: true },
  { label: "Liked Videos", href: "/liked", icon: <Heart />, auth: true },
  { label: "All Playlists", href: "/playlists", icon: <List />, auth: true },
];

export const HomeSidebar = () => {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarContent className="pt-16 bg-white">
        {/* Explore group */}
        <SidebarGroup>
          <SidebarMenu>
            {mainItems.map((item) => {
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    onClick={(e) => {
                      if (!isSignedIn && item.auth) {
                        e.preventDefault();
                        return clerk.openSignIn();
                      }
                    }}
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
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
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  onClick={(e) => {
                    if (!isSignedIn && item.auth) {
                      e.preventDefault();
                      return clerk.openSignIn();
                    }
                  }}
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
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
