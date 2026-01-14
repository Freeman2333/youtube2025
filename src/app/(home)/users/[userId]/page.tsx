import { HydrateClient, trpc } from "@/trpc/server";
import { UserView } from "@/modules/users/ui/views/user-view";

export const dynamic = "force-dynamic";

interface UserIdPageProps {
  params: Promise<{ userId: string }>;
}

const UserIdPage = async ({ params }: UserIdPageProps) => {
  const { userId } = await params;

  void trpc.users.getOne.prefetch({ userId });
  void trpc.videos.getMany.prefetchInfinite({ userId });

  return (
    <HydrateClient>
      <UserView userId={userId} />
    </HydrateClient>
  );
};

export default UserIdPage;
