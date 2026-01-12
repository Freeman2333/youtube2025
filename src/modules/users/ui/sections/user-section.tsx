"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import { UserBanner } from "@/modules/users/ui/components/user-banner";
import { UserPageInfo } from "@/modules/users/ui/components/user-page-info";

const UserSectionSkeleton = () => {
  return <div className="h-40 w-full bg-muted rounded-lg" />;
};

interface UserSectionProps {
  userId: string;
}

export const UserSection = ({ userId }: UserSectionProps) => {
  return (
    <Suspense fallback={<UserSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <UserSectionSuspense userId={userId} />
      </ErrorBoundary>
    </Suspense>
  );
};

function UserSectionSuspense({ userId }: { userId: string }) {
  const [user] = trpc.users.getOne.useSuspenseQuery({ userId });
  return (
    <div className="flex flex-col space-y-6 mb-8">
      <UserBanner user={user} />
      <UserPageInfo user={user} />
    </div>
  );
}
