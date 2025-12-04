import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HomeClient } from "./client";

const HomePage = async () => {
  void trpc.categories.getMany.prefetch();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <HomeClient />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default HomePage;
