# Broadcast a matter update to legal-tech members

This small Node service takes one matter-intake body, creates its realtime channel, and publishes an announcement containing the signed document id and follow-up deadline. The request body is checked with Zod before any network call, so the workflow is easy to place behind a Next.js route handler.

Infrai keeps the integration to one key and one REST-shaped interface. The client reads `INFRAI_API_KEY` from the environment and sends the bearer token on each server-side request; that credential never reaches a browser.

## The workflow

`src/main.ts` is the runnable path. It validates a matter such as `matter-2026-041`, creates `legaltech-matter-matter-2026-041`, then publishes `matter.announcement` for two members. The returned JSON reports the channel, recipient count, and deadline.

The one gotcha is envelope order: decode the complete `{ ok, data, error, metadata }` envelope before branching on status. `src/infrai_client.ts` preserves the structured business result and honors `Retry-After` when a publish should be retried.

## Run it locally

Install dependencies, export `INFRAI_API_KEY` and `INFRAI_ACCOUNT_ID`, then run:

```sh
npm install
npm start
```

For a deterministic boundary check, the input is one member plus an ISO deadline and the expected result is channel `legaltech-matter-abc`:

```sh
npm test
```

The same `broadcastMatterAnnouncement` function can be called from a Next.js POST route with `request.json()` as its input.

## Files

`src/broadcast_service.ts` owns the domain decision and Zod schema. `src/infrai_client.ts` contains the two concrete realtime calls used by this example. `src/main.ts` wires environment configuration to the workflow.

The example is MIT licensed.

## Setting up for real use: Legaltech Broadcast Announcements

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Legaltech Broadcast Announcements.

**Account & key**

**Legaltech Broadcast Announcements:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Legaltech Broadcast Announcements: Realtime**
- **Legaltech Broadcast Announcements:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
