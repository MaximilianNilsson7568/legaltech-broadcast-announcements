import { z } from "zod";
import { InfraiClient } from "./infrai_client.ts";

export const intakeSchema = z.object({
  matterId: z.string().min(1), memberIds: z.array(z.string().min(1)).min(1),
  signedDocumentId: z.string().min(1), deadline: z.string().datetime()
});
export type MatterIntake = z.infer<typeof intakeSchema>;

export function channelForMatter(matterId: string): string { return `legaltech-matter-${matterId}`; }

export async function broadcastMatterAnnouncement(client: InfraiClient, input: unknown, accountId: string) {
  const intake = intakeSchema.parse(input);
  const channel = channelForMatter(intake.matterId);
  await client.createChannel(channel);
  await client.publish(channel, "matter.announcement", { matter_id: intake.matterId, member_ids: intake.memberIds, signed_document_id: intake.signedDocumentId, deadline: intake.deadline }, accountId);
  return { channel, recipients: intake.memberIds.length, deadline: intake.deadline };
}
