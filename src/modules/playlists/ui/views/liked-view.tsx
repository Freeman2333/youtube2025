import { LikedSection } from "@/modules/playlists/ui/sections/liked-section";

export const LikedView = () => {
  return (
    <div className="max-w-[800px] mx-auto p-4">
      <h1 className="text-2xl font-bold">Liked</h1>
      <p className="text-muted-foreground mb-6">Videos you have liked</p>

      <LikedSection />
    </div>
  );
};
