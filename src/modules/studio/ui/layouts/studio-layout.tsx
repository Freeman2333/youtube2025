import { SidebarProvider } from "@/components/ui/sidebar";
import { PropsWithChildren } from "react";
import { StudioSidebar } from "../components/studio-sidebar";
import { StudioNavbar } from "../components/studio-navbar";

const StudioLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <div className="w-full">
          <StudioNavbar />
          <div className="flex min-h-screen">
            <StudioSidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default StudioLayout;
