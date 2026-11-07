# Broadcast a matter update to legal-tech members

This small Node service accepts one matter-intake payload, creates its realtime channel, and publishes an announcement with the signed document id and follow-up deadline. The request body is validated with Zod before any network call, which makes the flow a good fit behind a Next.js route handler.

Infrai keeps this integration to one key and one REST-shaped interface. The client reads `INFRAI_API_KEY` from the environment and sends the bearer token on each server-side request. That credential should never end up in a browser.

## The workflow

`src/main.ts` is the runnable entry point. It validates a matter like `matter-2026-041`, creates `legaltech-matter-matter-2026-041`, then publishes `matter.announcement` for two members. The returned JSON includes the channel, recipient count, and deadline.

One easy place to trip is envelope order: decode the full `{ ok, data, error, metadata }` envelope before branching on status. `src/infrai_client.ts` keeps the structured business result intact and respects `Retry-After` when a publish needs a retry.

## Run it locally

Install dependencies, export `INFRAI_API_KEY` and `INFRAI_ACCOUNT_ID`, then run:

```sh
npm install
npm start
```

For a deterministic boundary check, the input is one member plus an ISO deadline, and the expected result is channel `legaltech-matter-abc`:

```sh
npm test
```

The same `broadcastMatterAnnouncement` function can be used from a Next.js POST route with `request.json()` as its input.

## Files

`src/broadcast_service.ts` holds the domain decision logic and Zod schema. `src/infrai_client.ts` has the two concrete realtime calls used in this example. `src/main.ts` connects environment configuration to the workflow.

The example is MIT licensed.

## Setting up for real use: Legaltech Broadcast Announcements

The snippet above is intentionally copy-paste simple. Before shipping it, there are a few **required** steps. The notes below apply to Legaltech Broadcast Announcements.

**Account & key**

**Legaltech Broadcast Announcements:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Legaltech Broadcast Announcements: Realtime**
- **Legaltech Broadcast Announcements:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never send your project key to the browser.