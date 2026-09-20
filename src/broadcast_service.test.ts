import test from "node:test";
import assert from "node:assert/strict";
import { channelForMatter, intakeSchema } from "./broadcast_service.ts";

test("matter intake yields a stable broadcast channel", () => {
  const input = { matterId: "abc", memberIds: ["m1"], signedDocumentId: "doc1", deadline: "2026-09-15T17:00:00.000Z" };
  assert.equal(intakeSchema.parse(input).memberIds.length, 1);
  assert.equal(channelForMatter(input.matterId), "legaltech-matter-abc");
});
