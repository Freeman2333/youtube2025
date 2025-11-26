import { Button } from "@/components/ui/button";
import { UserCircleIcon } from "lucide-react";

export const AuthButton = () => (
  <Button className="flex items-center gap-2 rounded-full bg-transparent border border-blue-500/20 text-blue-500 px-4 py-2 hover:bg-blue-50 hover:border-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors shadow-none">
    <UserCircleIcon size={18} />
    Sign In
  </Button>
);
