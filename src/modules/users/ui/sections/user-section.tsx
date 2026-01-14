"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import {
  UserBanner,
  UserBannerSkeleton,
} from "@/modules/users/ui/components/user-banner";
import {
  UserPageInfo,
  UserPageInfoSkeleton,
} from "@/modules/users/ui/components/user-page-info";
import { Separator } from "@/components/ui/separator";

const UserSectionSkeleton = () => (
  <div className="flex flex-col space-y-6 mb-8">
    <UserBannerSkeleton />
    <UserPageInfoSkeleton />
  </div>
);

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
    <>
      <div className="flex flex-col space-y-6 mb-8">
        <UserBanner user={user} />
        <UserPageInfo user={user} />
      </div>
      <Separator className="mb-8" />
    </>
  );
}
