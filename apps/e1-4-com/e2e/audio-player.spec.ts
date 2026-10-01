import { randomBytes } from "node:crypto";

import { expect, test, type Browser, type Page } from "@playwright/test";

import { cleanupE2eUsers, db, loginAs } from "./helpers/auth";
import { makeWav, startFakeStorage, type FakeStorage } from "./helpers/fake-storage";

/**
 * Real WAV audio goes through the app into a storage fake that stores and serves it, then the
 * bead player (StreamField) is driven in the browser: tap, switch, replay, share, shared inbox.
 * Needs NEXT_PUBLIC_SUPABASE_URL to point at E2E_FAKE_STORAGE_PORT (default 54321).
 */
const STORAGE_PORT = Number(process.env.E2E_FAKE_STORAGE_PORT ?? 54321);
const SHORT = makeWav(1.2);
const LONG = makeWav(2.4);

// The bead field is WebGL; the CI browser renders it in software, so keep the canvas small enough
// that the page stays responsive while it plays.
test.use({ viewport: { width: 360, height: 360 } });
test.setTimeout(180_000);

let storage: FakeStorage;

test.beforeAll(async () => {
  storage = await startFakeStorage(STORAGE_PORT);
});
test.afterAll(async () => {
  await storage.close();
});
test.afterEach(async () => {
  await cleanupE2eUsers();
});

type Probe = { event: string; src: string; paused: boolean };

/** Records every play/pause/ended on audio elements created by the page (they are never in the DOM). */
async function watchAudio(page: Page) {
  await page.addInitScript(() => {
    // The metal field redraws every frame in software GL and starves the page; slow it right down.
    window.requestAnimationFrame = (cb) =>
      window.setTimeout(() => cb(performance.now()), 200);
    const log: Probe[] = [];
    (window as unknown as { __audio: Probe[] }).__audio = log;
    const note = (el: HTMLMediaElement, event: string) =>
      log.push({ event, src: el.src, paused: el.paused });
    const play = HTMLMediaElement.prototype.play;
    const pause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      this.addEventListener("ended", () => note(this, "ended"), { once: true });
      note(this, "play");
      return play.call(this);
    };
    HTMLMediaElement.prototype.pause = function (this: HTMLMediaElement) {
      note(this, "pause");
      return pause.call(this);
    };
  });
  return () => page.evaluate(() => (window as unknown as { __audio: Probe[] }).__audio);
}

async function upload(
  page: Page,
  wav: Buffer,
  durationMs: number,
  url = "/api/stream/segments",
) {
  const now = Date.now();
  const res = await page.request.post(url, {
    multipart: {
      audio: { name: "a.wav", mimeType: "audio/wav", buffer: wav },
      startedAt: new Date(now - durationMs).toISOString(),
      endedAt: new Date(now).toISOString(),
      durationMs: String(durationMs),
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()) as { segment?: { id: string }; note?: { id: string } };
}

async function newUser(browser: Browser, baseURL: string) {
  const context = await browser.newContext();
  const userId = await loginAs(context, baseURL);
  return { context, userId, page: await context.newPage() };
}

test("own stream: stored WAV is served back and plays on tap, one entry at a time", async ({
  page,
  context,
  baseURL,
}) => {
  await loginAs(context, baseURL!);
  const first = await upload(page, SHORT, 1200);
  await upload(page, LONG, 2400);

  // The storage fake really holds both files, byte for byte.
  const stored = [...storage.objects.values()].filter(
    (o) => o.contentType === "audio/wav",
  );
  expect(stored.map((o) => o.body.length).sort()).toEqual(
    [SHORT.length, LONG.length].sort(),
  );
  const served = await page.request.get(
    `/api/stream/segments/${first.segment!.id}/audio`,
  );
  expect(served.status()).toBe(200);
  expect(served.headers()["content-type"]).toBe("audio/wav");
  expect(Buffer.from(await served.body()).equals(SHORT)).toBe(true);

  const probe = await watchAudio(page);
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.goto("/stream");
  const one = page.getByRole("button", { name: "Entry 1" });
  const two = page.getByRole("button", { name: "Entry 2" });
  await expect(one).toBeVisible();
  await expect(two).toBeVisible();
  await expect(one).toHaveAttribute("aria-pressed", "false");

  // Tap: bead lights and the real audio starts from a blob made of the served bytes.
  await one.click();
  await expect(one).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => (await probe()).filter((e) => e.event === "play").length)
    .toBe(1);
  expect((await probe())[0].src).toMatch(/^blob:/);

  // Tapping another bead pauses the first and starts the second.
  await two.click();
  await expect(two).toHaveAttribute("aria-pressed", "true");
  await expect(one).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(async () => (await probe()).filter((e) => e.event === "play").length)
    .toBe(2);
  const log = await probe();
  expect(log.some((e) => e.event === "pause")).toBe(true);
  expect(log.filter((e) => e.event === "play")[1].src).not.toBe(log[0].src);

  // The second entry plays through to its end (2.4 s of real audio).
  await expect
    .poll(async () => (await probe()).some((e) => e.event === "ended"), {
      timeout: 10_000,
    })
    .toBe(true);

  // Tapping the same bead again plays it again from the start.
  await two.click();
  await expect
    .poll(async () => (await probe()).filter((e) => e.event === "play").length)
    .toBe(3);
});

test("a share link plays for a stranger, without a session", async ({
  page,
  context,
  baseURL,
  browser,
}) => {
  const userId = await loginAs(context, baseURL!);
  const { segment } = await upload(page, SHORT, 1200);
  const token = randomBytes(18).toString("base64url");
  await db.query(
    "insert into shares (id, token, user_id, segment_id) values (gen_random_uuid(), $1, $2, $3)",
    [token, userId, segment!.id],
  );

  const stranger = await browser.newContext();
  const sp = await stranger.newPage();
  const probe = await watchAudio(sp);
  await sp.goto(`/s/${token}`);
  const bead = sp.getByRole("button", { name: "Entry 1" });
  await bead.click();
  await expect(bead).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => (await probe()).some((e) => e.event === "play"))
    .toBe(true);
  await expect
    .poll(async () => (await probe()).some((e) => e.event === "ended"), {
      timeout: 10_000,
    })
    .toBe(true);

  // Revoked links stop serving the audio.
  await db.query("update shares set revoked_at = now() where token = $1", [token]);
  const gone = await sp.request.get(`/api/share/${token}/audio/${segment!.id}`);
  expect(gone.status()).toBe(404);
  await stranger.close();
});

test("shared inbox: a member plays a note another member recorded", async ({
  browser,
  baseURL,
}) => {
  const sender = await newUser(browser, baseURL!);
  const listener = await newUser(browser, baseURL!);
  const outsider = await newUser(browser, baseURL!);

  const {
    rows: [convo],
  } = await db.query<{ id: string }>(
    "insert into conversations (id, invite_token, created_by_id, updated_at) values (gen_random_uuid(), $1, $2, now()) returning id",
    [randomBytes(18).toString("base64url"), sender.userId],
  );
  await db.query(
    "insert into conversation_members (conversation_id, user_id, last_read_at) values ($1, $2, now()), ($1, $3, null)",
    [convo.id, sender.userId, listener.userId],
  );
  const { note } = await upload(sender.page, LONG, 2400, `/api/talk/${convo.id}/notes`);

  // The listener sees the conversation in the inbox, with the note unheard.
  await listener.page.goto("/talk");
  await expect(listener.page.locator(`a[href="/talk/${convo.id}"]`)).toBeVisible();

  const probe = await watchAudio(listener.page);
  await listener.page.goto(`/stream?talk=${convo.id}`);
  const bead = listener.page.getByRole("button", { name: "Entry 1" });
  await bead.click();
  await expect(bead).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => (await probe()).some((e) => e.event === "play"))
    .toBe(true);
  await expect
    .poll(async () => (await probe()).some((e) => e.event === "ended"), {
      timeout: 10_000,
    })
    .toBe(true);

  const bytes = await listener.page.request.get(`/api/talk/notes/${note!.id}/audio`);
  expect(bytes.status()).toBe(200);
  expect(Buffer.from(await bytes.body()).equals(LONG)).toBe(true);

  // A user outside the conversation gets neither the page nor the audio.
  const denied = await outsider.page.request.get(`/api/talk/notes/${note!.id}/audio`);
  expect([403, 404]).toContain(denied.status());
  const page404 = await outsider.page.goto(`/stream?talk=${convo.id}`);
  expect(page404?.status()).toBe(404);

  await Promise.all([sender, listener, outsider].map((u) => u.context.close()));
});
