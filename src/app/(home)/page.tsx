import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HomeView } from "@/modules/home/ui/views/home-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  const { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();
  void trpc.videos.getMany.prefetchInfinite({
    categoryId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <HomeView categoryId={categoryId} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default HomePage;
