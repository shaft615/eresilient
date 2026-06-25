/**
 * Client for the bia-engine FastAPI service.
 *
 * Two endpoints:
 *   POST /extract  — multipart .docx upload   → JSON BIA
 *   POST /render   — JSON BIA body            → .docx bytes
 *
 * HMAC: when BIA_API_SECRET is set, we sign the raw request body
 * (file bytes for /extract, JSON string for /render) with HMAC-SHA256
 * and send it in the `X-Signature` header. When the secret is unset,
 * we skip signing — useful for local dev where the engine is also
 * running without the secret.
 */
import { createHmac } from "node:crypto";

const ENGINE_URL = process.env.BIA_ENGINE_URL ?? "http://127.0.0.1:8765";
const SECRET = process.env.BIA_API_SECRET ?? "";

function sign(body: Uint8Array | string): Record<string, string> {
  if (!SECRET) return {};
  const buf = typeof body === "string" ? Buffer.from(body, "utf-8") : Buffer.from(body);
  const sig = createHmac("sha256", SECRET).update(buf).digest("hex");
  return { "X-Signature": sig };
}

/** Send a Word file to the engine and get a parsed BIA back. */
export async function engineExtract(file: File): Promise<unknown> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  // We construct multipart manually so the bytes we sign match the bytes
  // the engine reads from the upload. Letting fetch build a FormData boundary
  // for us would change the body and break the signature.
  const boundary = "----biaengine" + Math.random().toString(16).slice(2);
  const head = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${file.name.replace(/"/g, "")}"\r\n` +
      `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`,
    "utf-8",
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, "utf-8");
  const body = Buffer.concat([head, Buffer.from(bytes), tail]);

  // The engine signs over the raw file bytes, not the multipart envelope.
  const headers: Record<string, string> = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    ...sign(bytes),
  };

  const res = await fetch(`${ENGINE_URL}/extract`, {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`engine /extract ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

/** Send a BIA JSON to the engine and get rendered .docx bytes back. */
export async function engineRender(bia: unknown): Promise<Buffer> {
  const json = JSON.stringify(bia);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...sign(json),
  };
  const res = await fetch(`${ENGINE_URL}/render`, {
    method: "POST",
    headers,
    body: json,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`engine /render ${res.status}: ${text.slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
