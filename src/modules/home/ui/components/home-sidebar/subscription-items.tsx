"use client";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { trpc } from "@/trpc/client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SignedIn } from "@clerk/nextjs";
import { List } from "lucide-react";
import { DEFAULT_LIMIT } from "@/constants";

const SubscriptionItemsSkeleton = () => (
  <SidebarGroup>
    <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
    <SidebarMenu>
      {Array.from({ length: 5 }).map((_, i) => (
        <SidebarMenuItem key={i}>
          <div className="flex items-center gap-2 animate-pulse py-1">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </div>
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem>
        <div className="flex items-center gap-2 animate-pulse py-1">
          <List className="h-5 w-5 text-muted-foreground" />
          <div className="h-4 w-full rounded bg-muted" />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
);

const SubscriptionItemsSuspense = () => {
  const pathname = usePathname();
  const [data] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  const subscriptions = data.pages.flatMap((p) => p.items);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarMenu>
        {subscriptions.map((user) => (
          <SidebarMenuItem key={user.id}>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/users/" + user.id}
            >
              <Link
                href={`/users/${user.id}`}
                className="flex items-center gap-2"
                prefetch
              >
                <UserAvatar
                  src={user.imageUrl}
                  firstName={user.name}
                  size="xs"
                />
                <span className="truncate">{user.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === "/subscriptions"}>
            <Link
              href="/subscriptions"
              className="flex items-center gap-2"
              prefetch
            >
              <List className="h-5 w-5" />
              <span>All subscriptions</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export const SubscriptionItems = () => (
  <SignedIn>
    <SidebarSeparator />
    <Suspense fallback={<SubscriptionItemsSkeleton />}>
      <ErrorBoundary
        fallback={
          <SidebarGroupLabel>Error loading subscriptions</SidebarGroupLabel>
        }
      >
        <SubscriptionItemsSuspense />
      </ErrorBoundary>
    </Suspense>
  </SignedIn>
);
