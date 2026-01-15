import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Home, Rss, FlameIcon } from "lucide-react";
import type { SidebarItem } from "@/modules/home/ui/components/home-sidebar/types";

const mainItems: SidebarItem[] = [
  { label: "Home", href: "/", icon: <Home /> },
  {
    label: "Subscriptions",
    href: "/feed/subscriptions",
    icon: <Rss />,
    auth: true,
  },
  { label: "Trending", href: "/feed/trending", icon: <FlameIcon /> },
];

export const MainItems = () => {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {mainItems.map((item) => (
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
  );
};
