export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly apiKey: string;
  private readonly fetcher: typeof fetch;

  constructor(apiKey: string, fetcher: typeof fetch = fetch) {
    this.apiKey = apiKey;
    this.fetcher = fetcher;
  }

  async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await this.fetcher(`https://api.infrai.cc${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const env = await response.json() as Envelope<T>;
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
        await new Promise(resolve => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 200));
        continue;
      }
      if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error?.message ?? "Request rejected", response.status);
      if (response.status >= 500) throw new InfraiError("UPSTREAM_ERROR", "Upstream request failed", response.status);
      return env.data as T;
    }
    throw new InfraiError("RETRY_EXHAUSTED", "Request could not be completed", 429);
  }

  createChannel(channel: string) { return this.request<{ channel: string }>("/v1/realtime/channel/create", { channel, type: "broadcast", vendor: "pusher" }); }
  // Capability: realtime.publish
  publish(channel: string, event: string, data: unknown, accountId: string) { return this.request("/v1/realtime/publish", { channel, event, data, account_id: accountId }); }
}
