import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Clock, Heart, List } from "lucide-react";
import type { SidebarItem } from "@/modules/home/ui/components/home-sidebar/types";

const personalItems: SidebarItem[] = [
  { label: "History", href: "/playlists/history", icon: <Clock />, auth: true },
  {
    label: "Liked Videos",
    href: "/playlists/liked",
    icon: <Heart />,
    auth: true,
  },
  { label: "All Playlists", href: "/playlists", icon: <List />, auth: true },
];

export const PersonalItems = () => {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Personal</SidebarGroupLabel>
      <SidebarMenu>
        {personalItems.map((item) => (
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
              <Link
                href={item.href}
                className="flex items-center gap-2"
                prefetch
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
