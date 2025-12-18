"use client";

import { VideoIcon, BotIcon, LogOutIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { UserAvatar } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const StudioSidebar = () => {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { state } = useSidebar();

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="pt-20 bg-white">
        {/* USER SECTION */}
        <div
          className={cn(
            "flex flex-col items-center px-6 pb-2",
            isCollapsed && "px-2 pb-0"
          )}
        >
          {isLoaded ? (
            <Link href={`users/${user?.id}`}>
              <UserAvatar
                src={user?.imageUrl}
                firstName={user?.firstName}
                lastName={user?.lastName}
                username={user?.username}
                email={user?.emailAddresses?.[0]?.emailAddress}
                size={isCollapsed ? "xs" : "lg"}
                className="transition-all"
              />
            </Link>
          ) : (
            <Skeleton
              className={cn(
                "rounded-full",
                isCollapsed ? "size-4" : "size-[112px]"
              )}
            />
          )}

          {!isCollapsed && isLoaded && (
            <div className="mt-4 flex flex-col gap-1 text-center">
              <p className="text-sm font-semibold">Your Profile</p>
              <p className="text-xs text-muted-foreground">
                {user?.username || user?.fullName || "User"}
              </p>
            </div>
          )}

          {!isLoaded && (
            <div className="mt-4 text-center w-20 flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Content"
                asChild
                isActive={pathname === "/studio"}
              >
                <Link href="/studio" className="flex items-center gap-2">
                  <VideoIcon />
                  <span>Content</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/studio/ai-settings"}
                tooltip="AI Settings"
              >
                <Link
                  href="/studio/ai-settings"
                  className="flex items-center gap-2"
                >
                  <BotIcon />
                  <span>AI Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Exit studio">
                <Link href="/" className="flex items-center gap-2">
                  <LogOutIcon className="h-4 w-4" />
                  <span>Exit Studio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
