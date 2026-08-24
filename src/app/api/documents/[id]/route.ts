import { NextResponse } from "next/server";
import { getPortalIdentity } from "@/lib/portal-auth";
import { findClientForEmails, getDocument } from "@/lib/portal-db";
import { getDocumentBlob } from "@/lib/blob";

/**
 * Authorized deliverable download. Blobs are private in the store; this
 * route is the only path to the bytes: signed-in admin, or a signed-in
 * user whose email belongs to the document's client.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const identity = await getPortalIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const doc = await getDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!identity.isAdmin) {
    const client = await findClientForEmails(identity.emails);
    if (!client || client.id !== doc.clientId) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }
  }

  const blob = await getDocumentBlob(doc.blobUrl);
  if (!blob) {
    return NextResponse.json(
      { error: "Document storage unavailable." },
      { status: 503 },
    );
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Type": doc.contentType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${doc.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
