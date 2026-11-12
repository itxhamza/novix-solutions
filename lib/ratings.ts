/**
 * Public App Store rating for a listing, from the iTunes Lookup API.
 *
 * Fetched at build time and refreshed daily. Every failure path returns
 * undefined so the page simply hides the rating — a rating is never invented,
 * cached stale forever, or hard-coded.
 */

export type Rating = { average: number; count: number };

const DAY = 86_400;

export async function getAppStoreRating(appId: string): Promise<Rating | undefined> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${encodeURIComponent(appId)}`,
      { next: { revalidate: DAY } },
    );
    if (!res.ok) return undefined;

    const data: unknown = await res.json();
    const entry = (data as { results?: unknown[] })?.results?.[0] as
      | { averageUserRating?: unknown; userRatingCount?: unknown }
      | undefined;

    const average = entry?.averageUserRating;
    const count = entry?.userRatingCount;

    // No ratings yet is not a rating — hide it rather than showing "0".
    if (typeof average !== "number" || typeof count !== "number" || count < 1) return undefined;

    return { average: Math.round(average * 10) / 10, count };
  } catch {
    return undefined;
  }
}
