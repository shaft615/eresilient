/**
 * Vercel Blob helpers for client deliverables.
 *
 * Blobs are stored PRIVATE — nothing is fetchable without the store token.
 * Clients download through /api/documents/[id], which authorizes against
 * client_users membership before streaming the blob.
 *
 * Graceful no-op pattern: without BLOB_READ_WRITE_TOKEN, hasBlob() is
 * false and the admin upload form explains what to provision.
 */
import { del, get, put } from "@vercel/blob";

export function hasBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadDocumentBlob(opts: {
  clientId: string;
  filename: string;
  file: File;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!hasBlob()) return { ok: false, error: "Blob storage is not configured." };
  try {
    const safeName = opts.filename.replace(/[^\w.\-]+/g, "_");
    const result = await put(
      `documents/${opts.clientId}/${safeName}`,
      opts.file,
      { access: "private", addRandomSuffix: true },
    );
    return { ok: true, url: result.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[blob] uploadDocumentBlob failed", message);
    return { ok: false, error: message };
  }
}

export async function deleteDocumentBlob(url: string): Promise<void> {
  if (!hasBlob()) return;
  try {
    await del(url);
  } catch (err) {
    console.error("[blob] deleteDocumentBlob failed", err);
  }
}

/** Fetch a private blob's stream + headers for relaying to the client. */
export async function getDocumentBlob(url: string) {
  if (!hasBlob()) return null;
  try {
    return await get(url, { access: "private" });
  } catch (err) {
    console.error("[blob] getDocumentBlob failed", err);
    return null;
  }
}
