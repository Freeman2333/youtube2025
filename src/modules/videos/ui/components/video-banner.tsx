import { AlertTriangle } from "lucide-react";
import { MuxStatus } from "@/db/schema";

export const VideoBanner = ({ muxStatus }: { muxStatus: MuxStatus }) => {
  const isReady = muxStatus === MuxStatus.READY;

  if (isReady) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2 text-amber-600">
        <AlertTriangle className="h-5 w-5" />
        <div className="text-sm font-medium">Video is still processing</div>
      </div>
    </div>
  );
};
