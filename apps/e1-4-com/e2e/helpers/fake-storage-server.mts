import { startFakeStorage } from "./fake-storage.ts";

/**
 * Runs the Storage fake on its own, for checks that are not Playwright specs (the deletion proof
 * in `live/`). `node e2e/helpers/fake-storage-server.mts`; Node 22 runs TypeScript directly.
 */
const port = Number(process.env.E2E_FAKE_STORAGE_PORT ?? 54321);
const fake = await startFakeStorage(port);
console.log(`storage fake listening on ${fake.url}`);
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => void fake.close().then(() => process.exit(0)));
}
