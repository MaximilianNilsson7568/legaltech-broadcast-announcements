import { InfraiClient } from "./infrai_client.ts";
import { broadcastMatterAnnouncement } from "./broadcast_service.ts";

const apiKey = process.env.INFRAI_API_KEY;
const accountId = process.env.INFRAI_ACCOUNT_ID;
if (!apiKey || !accountId) throw new Error("Set INFRAI_API_KEY and INFRAI_ACCOUNT_ID");

const result = await broadcastMatterAnnouncement(new InfraiClient(apiKey), {
  matterId: "matter-2026-041",
  memberIds: ["member-ada", "member-lin"],
  signedDocumentId: "signed-doc-88",
  deadline: "2026-09-15T17:00:00.000Z"
}, accountId);
console.log(JSON.stringify(result, null, 2));
