import { VideosSection } from "@/modules/studio/ui/sections/videos-section";

export const StudioView = () => {
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] flex-col px-4 pt-2.5">
      <h1 className="text-2xl font-bold">Channel content</h1>
      <p className="text-xs text-muted-foreground mb-3">
        Manage your channel content and videos.
      </p>
      <VideosSection />
    </div>
  );
};
