import { HistorySection } from "@/modules/playlists/ui/sections/history-section";

export const HistoryView = () => {
  return (
    <div className="max-w-[800px] mx-auto p-4">
      <h1 className="text-2xl font-bold">History</h1>
      <p className="text-muted-foreground mb-6">Videos you have watched</p>

      <HistorySection />
    </div>
  );
};
