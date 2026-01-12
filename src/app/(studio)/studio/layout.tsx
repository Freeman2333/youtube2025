import { PropsWithChildren } from "react";

import { HydrateClient, trpc } from "@/trpc/server";

import StudioLayout from "@/modules/studio/ui/layouts/studio-layout";

const Layout = async ({ children }: PropsWithChildren) => {
  await trpc.users.getCurrent.prefetch();

  return (
    <HydrateClient>
      <StudioLayout>{children}</StudioLayout>
    </HydrateClient>
  );
};

export default Layout;
