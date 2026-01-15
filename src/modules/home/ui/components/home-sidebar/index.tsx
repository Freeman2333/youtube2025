"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { MainItems } from "@/modules/home/ui/components/home-sidebar/main-items";
import { PersonalItems } from "@/modules/home/ui/components/home-sidebar/personal-items";
import { SubscriptionItems } from "@/modules/home/ui/components/home-sidebar/subscription-items";

export const HomeSidebar = () => {
  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarContent className="pt-16 bg-white">
        <MainItems />
        <SidebarSeparator />
        <PersonalItems />
        <SubscriptionItems />
      </SidebarContent>
    </Sidebar>
  );
};
