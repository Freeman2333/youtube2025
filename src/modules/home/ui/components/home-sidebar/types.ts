import type { ReactNode } from "react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: ReactNode;
  auth?: boolean;
};

export interface MainItemsProps {
  items: SidebarItem[];
}

export interface PersonalItemsProps {
  items: SidebarItem[];
}
