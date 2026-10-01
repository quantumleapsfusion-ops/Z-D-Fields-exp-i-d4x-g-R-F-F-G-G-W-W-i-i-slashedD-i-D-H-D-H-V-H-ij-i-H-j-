import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserId = vi.fn<() => Promise<string | null>>();
const hardDeleteUser = vi.fn();
const endSession = vi.fn();

vi.mock("@/lib/auth/user", () => ({ getUserId }));
vi.mock("@/lib/privacy/hard-delete", () => ({ hardDeleteUser }));
vi.mock("@/lib/auth/session", () => ({ endSession }));

const { DELETE } = await import("./route");
const request = () => new Request("http://e1-4.test/api/account", { method: "DELETE" });

describe("DELETE /api/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses without a session and destroys nothing", async () => {
    getUserId.mockResolvedValue(null);
    const res = await DELETE(request(), undefined);
    expect(res.status).toBe(401);
    expect(hardDeleteUser).not.toHaveBeenCalled();
    expect(endSession).not.toHaveBeenCalled();
  });

  it("destroys the signed-in person's data, then ends the session", async () => {
    getUserId.mockResolvedValue("user-1");
    const order: string[] = [];
    hardDeleteUser.mockImplementation(async (id: string) => {
      order.push(`delete:${id}`);
      return { userId: id, objectsDeleted: 3, dbRowsRemoved: true };
    });
    endSession.mockImplementation(async () => {
      order.push("end-session");
    });

    const res = await DELETE(request(), undefined);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, objectsDeleted: 3 });
    expect(order).toEqual(["delete:user-1", "end-session"]);
  });

  it("keeps the session when the deletion throws, so it can be retried", async () => {
    getUserId.mockResolvedValue("user-1");
    hardDeleteUser.mockRejectedValue(new Error("storage down"));
    await expect(DELETE(request(), undefined)).rejects.toThrow("storage down");
    expect(endSession).not.toHaveBeenCalled();
  });
});
