import { createServer, type IncomingMessage, type Server } from "node:http";

/** A WAV of a rising tone with a pulse, so the sound analysis has something real to measure. */
export function makeWav(seconds: number, sampleRate = 22_050): Buffer {
  const n = Math.round(seconds * sampleRate);
  const pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const env = 0.5 + 0.5 * Math.sin(2 * Math.PI * 3 * t);
    const v = Math.sin(2 * Math.PI * (220 + 180 * (t / seconds)) * t) * env * 0.6;
    pcm.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks);
}

export interface FakeStorage {
  url: string;
  objects: Map<string, { body: Buffer; contentType: string }>;
  close(): Promise<void>;
}

/**
 * Just enough of the Supabase Storage REST API (upload, download, list, remove, sign) for the
 * app's `SupabaseStorageProvider`: it really stores what it is given and serves it back.
 */
export async function startFakeStorage(port: number): Promise<FakeStorage> {
  const objects = new Map<string, { body: Buffer; contentType: string }>();
  const json = (
    res: import("node:http").ServerResponse,
    status: number,
    data: unknown,
  ) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  const server: Server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://fake");
      const path = decodeURIComponent(url.pathname).replace(/^\/storage\/v1\//, "");
      const body = await readBody(req);

      if (req.method === "POST" && path.startsWith("object/list/")) {
        const bucket = path.slice("object/list/".length);
        const { prefix = "" } = JSON.parse(body.toString() || "{}") as {
          prefix?: string;
        };
        const dir = prefix ? `${prefix}/` : "";
        const seen = new Map<string, boolean>();
        for (const key of objects.keys()) {
          if (!key.startsWith(`${bucket}/${dir}`)) continue;
          const rest = key.slice(`${bucket}/${dir}`.length);
          const [head, ...tail] = rest.split("/");
          seen.set(head, tail.length > 0);
        }
        return json(
          res,
          200,
          [...seen].map(([name, folder]) => ({ name, id: folder ? null : name })),
        );
      }

      if (req.method === "POST" && path.startsWith("object/sign/")) {
        return json(res, 200, {
          signedURL: `/${path.replace("object/sign/", "object/")}?token=x`,
        });
      }

      if (req.method === "DELETE" && path.startsWith("object/")) {
        const bucket = path.slice("object/".length);
        const { prefixes = [] } = JSON.parse(body.toString() || "{}") as {
          prefixes?: string[];
        };
        for (const p of prefixes) objects.delete(`${bucket}/${p}`);
        return json(res, 200, []);
      }

      if (path.startsWith("object/")) {
        const key = path.replace(/^object\/(authenticated\/|public\/)?/, "");
        if (req.method === "POST" || req.method === "PUT") {
          const type = req.headers["content-type"] ?? "application/octet-stream";
          let data = body;
          let contentType = type;
          if (type.startsWith("multipart/form-data")) {
            const form = await new Response(new Uint8Array(body), {
              headers: { "content-type": type },
            }).formData();
            const file = [...form.values()].find((v): v is File => typeof v !== "string");
            if (file) {
              data = Buffer.from(await file.arrayBuffer());
              contentType = file.type || "application/octet-stream";
            }
          }
          objects.set(key, { body: data, contentType });
          return json(res, 200, { Key: key });
        }
        if (req.method === "GET") {
          const hit = objects.get(key);
          if (!hit)
            return json(res, 404, { error: "not_found", message: "Object not found" });
          res.writeHead(200, {
            "Content-Type": hit.contentType,
            "Content-Length": hit.body.length,
          });
          return res.end(hit.body);
        }
      }
      json(res, 404, { error: "unhandled", path });
    } catch (error) {
      json(res, 500, { error: String(error) });
    }
  });

  await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${port}`,
    objects,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
