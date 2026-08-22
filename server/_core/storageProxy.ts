import type { Express } from "express";
import { ENV } from "./env";

export function isSafeStorageKey(key: string): boolean {
  return key.length > 0
    && key.length <= 512
    && !key.includes("..")
    && /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(key);
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*key", async (req, res) => {
    const rawKey = (req.params as { key?: string | string[] }).key;
    const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;
    if (!key || !isSafeStorageKey(key)) {
      res.status(400).send("Invalid storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
