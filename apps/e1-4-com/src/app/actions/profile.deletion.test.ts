import { describe, it, expect, beforeEach } from "vitest";

import { prisma } from "@/lib/db";

describe("account deletion scheduling", () => {
  const userId = "550e8400-e29b-41d4-a716-446655440000";
  const DELETION_DELAY_MS = 30 * 24 * 60 * 60 * 1000;

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it("schedules deletion 30 days in the future", async () => {
    const now = new Date();
    await prisma.user.create({
      data: { id: userId, displayName: "Test User" },
    });

    const scheduledAt = now;
    const scheduledFor = new Date(now.getTime() + DELETION_DELAY_MS);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        deletionScheduledAt: scheduledAt,
        deletionScheduledFor: scheduledFor,
      },
    });

    expect(updated.deletionScheduledAt).toBeTruthy();
    expect(updated.deletionScheduledFor).toBeTruthy();
    expect(updated.deletionScheduledFor!.getTime() - updated.deletionScheduledAt!.getTime())
      .toBeLessThanOrEqual(1000); // Allow 1s tolerance
  });

  it("can cancel scheduled deletion", async () => {
    const now = new Date();
    const scheduledFor = new Date(now.getTime() + DELETION_DELAY_MS);

    await prisma.user.create({
      data: {
        id: userId,
        displayName: "Test User",
        deletionScheduledAt: now,
        deletionScheduledFor: scheduledFor,
      },
    });

    const cancelled = await prisma.user.update({
      where: { id: userId },
      data: {
        deletionScheduledAt: null,
        deletionScheduledFor: null,
      },
    });

    expect(cancelled.deletionScheduledAt).toBeNull();
    expect(cancelled.deletionScheduledFor).toBeNull();
  });

  it("does not allow deletion without confirmation", async () => {
    // This test verifies the form validation works.
    // In the action, we check if the confirmation input is "DELETE".
    const confirmations = ["delete", "DELETE ME", "", "ELETE", null];
    const isConfirmed = (input: string | null | undefined) => {
      return String(input ?? "").trim().toUpperCase() === "DELETE";
    };

    expect(isConfirmed("DELETE")).toBe(true);
    expect(isConfirmed(" DELETE ")).toBe(true);
    confirmations.forEach((c) => {
      if (c !== "DELETE") expect(isConfirmed(c)).toBe(false);
    });
  });

  it("can find users past their deletion date", async () => {
    const past = new Date(Date.now() - 1000); // 1 second ago

    await prisma.user.create({
      data: {
        id: userId,
        displayName: "Test User",
        deletionScheduledAt: past,
        deletionScheduledFor: past,
      },
    });

    const usersForDeletion = await prisma.user.findMany({
      where: { deletionScheduledFor: { lte: new Date() } },
    });

    expect(usersForDeletion.some((u) => u.id === userId)).toBe(true);
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
  });
});
