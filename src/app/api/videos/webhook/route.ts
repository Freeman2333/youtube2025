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
  }

  return new NextResponse("Webhook received", { status: 200 });
}
