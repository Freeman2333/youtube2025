"use client";
import { trpc } from "@/trpc/client";

export function HomeClient() {
  const [data] = trpc.categories.getMany.useSuspenseQuery();
  return <div>{JSON.stringify(data, null, 2)}</div>;
}
