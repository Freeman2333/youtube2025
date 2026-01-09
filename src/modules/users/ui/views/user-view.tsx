import { UserSection } from "@/modules/users/ui/sections/user-section";

interface UserViewProps {
  userId: string;
}

export const UserView = ({ userId }: UserViewProps) => {
  return (
    <div className="max-w-[1300px] mx-auto px-4 pt-2.5 mb-10">
      <UserSection userId={userId} />
    </div>
  );
};
