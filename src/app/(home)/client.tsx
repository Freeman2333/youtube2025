"use client";
import { trpc } from "@/trpc/client";
export function HomeClient() {
  const [data] = trpc.hello.useSuspenseQuery({ text: "from Home Page" });
  return <div>{data.greeting}</div>;
}
