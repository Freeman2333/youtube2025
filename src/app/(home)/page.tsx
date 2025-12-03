import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HomeClient } from "./client";

export default async function Home() {
  void trpc.hello.prefetch({ text: "from Home Page" });

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <HomeClient />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
