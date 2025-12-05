"use client";

import { Button } from "@/components/ui/button";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { ClapperboardIcon, UserCircleIcon } from "lucide-react";

export const AuthButton = () => (
  <div className="flex justify-end">
    <SignedOut>
      <SignInButton mode="modal">
        <Button className="flex items-center gap-2 rounded-full bg-transparent border border-blue-500/20 text-blue-500 px-4 py-2 hover:bg-blue-50 hover:border-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors shadow-none">
          <UserCircleIcon size={18} />
          Sign In
        </Button>
      </SignInButton>
    </SignedOut>
    <SignedIn>
      <UserButton>
        <UserButton.MenuItems>
          {/* TODO: Add user profile menu button */}
          <UserButton.Link
            label="Studio"
            labelIcon={<ClapperboardIcon className="size-4" />}
            href="/studio"
          />
          <UserButton.Action label="manageAccount" />
          <UserButton.Action label="signOut" />
        </UserButton.MenuItems>
      </UserButton>
    </SignedIn>
  </div>
);
