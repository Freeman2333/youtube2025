"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { SearchInput } from "./search-input";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import { useState } from "react";
import { Search, ArrowLeft } from "lucide-react";

export const HomeNavbar = () => {
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <nav className="flex justify-between h-16 sticky l-0 t-0 r-0 z-50 bg-white px-2 items-center py-1 pr-5">
      {mobileSearch ? (
        <div className="flex w-full items-center md:hidden">
          <button
            aria-label="Close search"
            className="p-2"
            onClick={() => setMobileSearch(false)}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <SearchInput />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center">
            <SidebarTrigger />
            <Link href="/" className="ml-4 text-lg font-semibold mr-2" prefetch>
              <div className="flex gap-1">
                <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                <p className="text-xl font-semibold tracking-tight">Youtube</p>
              </div>
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="hidden md:block w-full max-w-xl">
              <SearchInput />
            </div>
          </div>
          <div className="min-w-[103px] flex items-center justify-end gap-2">
            <button
              aria-label="Open search"
              className="p-2 md:hidden"
              onClick={() => setMobileSearch(true)}
            >
              <Search size={20} />
            </button>
            <AuthButton />
          </div>
        </>
      )}
    </nav>
  );
};
