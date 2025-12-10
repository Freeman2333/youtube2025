import { db } from "@/db";
import { MuxStatus, videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const MUX_SIGNING_SECRET = process.env.MUX_SIGNING_SECRET!;

export async function POST(req: NextRequest) {
  const muxSignature = req.headers.get("mux-signature");
  if (!muxSignature) {
    return new NextResponse("Failed to verify signature!", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    MUX_SIGNING_SECRET
  );

  switch (payload.type) {
    case "video.asset.created": {
      const data = payload.data;

      if (!data.upload_id) {
        return new NextResponse("No upload id found!", { status: 404 });
      }

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: Object.values(MuxStatus).includes(data.status)
            ? data.status
            : MuxStatus.CANCELLED,
        })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;
    }
    case "video.asset.ready": {
      const data = payload.data;
      if (!data.upload_id) {
        return new NextResponse("No upload id found!", { status: 404 });
      }

      const playbackId = data.playback_ids?.[0].id;
      if (!playbackId) {
        return new NextResponse("No playback id found!", { status: 404 });
      }

      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      const previewUrl = `${process.env.NEXT_PUBLIC_MUX_IMAGE_BASE_URL}/${playbackId}/animated.gif`;
      const thumbnailUrl = `${process.env.NEXT_PUBLIC_MUX_IMAGE_BASE_URL}/${playbackId}/thumbnail.jpg`;

      await db
        .update(videos)
        .set({
          duration,
          muxAssetId: data.id,
          muxPlaybackId: playbackId,
          muxStatus: Object.values(MuxStatus).includes(data.status as MuxStatus)
            ? (data.status as MuxStatus)
            : MuxStatus.CANCELLED,
          previewUrl,
          thumbnailUrl,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
    }
    case "video.asset.errored": {
      const data = payload.data;

      if (!data.upload_id) {
        return new NextResponse("No upload id found!", { status: 404 });
      }

      await db
        .update(videos)
        .set({
          muxStatus: Object.values(MuxStatus).includes(data.status as MuxStatus)
            ? (data.status as MuxStatus)
            : MuxStatus.CANCELLED,
        })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;
    }
    case "video.asset.deleted": {
      const data = payload.data;

      await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));

      break;
    }
    case "video.asset.track.ready": {
      const data = payload.data;

      const assetId = data.asset_id;

      if (!assetId) {
        return new NextResponse("No asset id found!", { status: 404 });
      }

      await db
        .update(videos)
        .set({
          muxTrackId: data.id,
          muxTrackStatus: Object.values(MuxStatus).includes(
            data.status as MuxStatus
          )
            ? (data.status as MuxStatus)
            : MuxStatus.CANCELLED,
        })
        .where(eq(videos.muxAssetId, assetId));

      break;
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}
