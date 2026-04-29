type Bucket = {
  hits: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function assertRateLimit(key: string, maxHits = 8, windowMs = 60_000): void {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt < now) {
    buckets.set(key, { hits: 1, resetAt: now + windowMs });
    return;
  }

  if (current.hits >= maxHits) {
    throw new Error("Trop de requetes. Veuillez reessayer plus tard.");
  }

  current.hits += 1;
}
