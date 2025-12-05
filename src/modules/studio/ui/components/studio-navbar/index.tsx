import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import { StudioUploadModal } from "../studio-upload-modal";

export const StudioNavbar = () => {
  return (
    <nav className="flex justify-between h-16 sticky l-0 t-0 r-0 z-50 bg-white px-2 items-center py-1 pr-5 shadow-md">
      <div className="flex items-center">
        <SidebarTrigger />
        <Link href="/" className="ml-4 text-lg font-semibold">
          <div className="flex gap-1">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <p className="text-xl font-semibold tracking-tight">Studio</p>
          </div>
        </Link>
      </div>
      <div className="ml-auto flex gap-3">
        <StudioUploadModal />
        <AuthButton />
      </div>
    </nav>
  );
};
