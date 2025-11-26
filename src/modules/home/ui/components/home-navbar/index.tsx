import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { SearchInput } from "./search-input";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";

export const HomeNavbar = () => {
  return (
    <nav className="flex justify-between h-16 sticky l-0 t-0 r-0 z-50 bg-white px-2 items-center py-1 pr-5">
      <div className="flex items-center">
        <SidebarTrigger />
        <Link href="/" className="ml-4 text-lg font-semibold">
          <div className="flex gap-1">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <p className="text-xl font-semibold tracking-tight">Youtube</p>
          </div>
        </Link>
      </div>
      <SearchInput />
      <AuthButton />
    </nav>
  );
};
