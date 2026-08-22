import type { Express } from "express";
import { ENV } from "./env";
import { createContext } from "./context";

export function isSafeStorageKey(key: string): boolean {
  return key.length > 0
    && key.length <= 512
    && !key.includes("..")
    && /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(key);
}

export function getStorageOwnerId(key: string): number | undefined {
  const match = key.match(/^users\/(\d+)\//);
  if (!match) return undefined;
  const ownerId = Number(match[1]);
  return Number.isSafeInteger(ownerId) && ownerId > 0 ? ownerId : undefined;
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*key", async (req, res) => {
    const rawKey = (req.params as { key?: string | string[] }).key;
    const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;
    if (!key || !isSafeStorageKey(key)) {
      res.status(400).send("Invalid storage key");
      return;
    }

    const ownerId = getStorageOwnerId(key);
    if (ownerId) {
      const ctx = await createContext({ req, res } as any);
      if (!ctx.user) {
        res.status(401).send("Authentication required");
        return;
      }
      if (ctx.user.id !== ownerId) {
        res.status(403).send("Storage object not owned by user");
        return;
      }
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
        console.error(`[StorageProxy] forge error: ${forgeResp.status}`);
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
    } catch {
      console.error("[StorageProxy] failed");
      res.status(502).send("Storage proxy error");
    }
  });
}
