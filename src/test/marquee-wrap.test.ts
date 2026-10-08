import { describe, expect, it } from "vitest";

/**
 * The marquee's wrap arithmetic, extracted.
 *
 * This is the one genuinely tricky part of the cylinder effect: items are
 * duplicated and the track slides by a full loop, so mapping an item to "where
 * it currently appears in the band" is easy to get subtly wrong in a way that
 * only shows as items turning while off-screen. jsdom can't exercise the
 * rendering, but it can pin the maths.
 *
 * Mirrors the computation in `use-marquee-velocity.ts`.
 */
function bandOffset(rest: number, x: number, trackWidth: number, bandWidth: number) {
  let itemCentre = rest + x;
  itemCentre = ((itemCentre % trackWidth) + trackWidth) % trackWidth;
  if (itemCentre > bandWidth) itemCentre -= trackWidth;
  const half = bandWidth / 2;
  return Math.max(-1, Math.min(1, (itemCentre - half) / half));
}

const TRACK = 2000; // one loop
const BAND = 800;

describe("marquee wrap", () => {
  it("scores an item at the band centre as 0", () => {
    expect(bandOffset(400, 0, TRACK, BAND)).toBeCloseTo(0);
  });

  it("scores the band edges as -1 and 1", () => {
    expect(bandOffset(0, 0, TRACK, BAND)).toBeCloseTo(-1);
    expect(bandOffset(800, 0, TRACK, BAND)).toBeCloseTo(1);
  });

  it("stays within -1..1 for every position across a full loop", () => {
    for (let x = -TRACK; x <= TRACK; x += 7) {
      for (const rest of [0, 250, 600, 1200, 1900]) {
        const v = bandOffset(rest, x, TRACK, BAND);
        expect(v).toBeGreaterThanOrEqual(-1);
        expect(v).toBeLessThanOrEqual(1);
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });

  it("wraps an item past the right edge back to the approaching side", () => {
    // Sitting just beyond the band's right edge belongs to the copy coming in
    // from the left, so it must score negative, not clamp at +1.
    const justPast = BAND + 10;
    expect(bandOffset(justPast, 0, TRACK, BAND)).toBeLessThan(0);
  });

  it("moves an item monotonically leftward as the track translates left", () => {
    // Travel direction must be consistent: increasingly negative x should walk
    // an item toward the left edge, never jitter back and forth.
    const seen = [0, -50, -100, -150, -200].map((x) => bandOffset(400, x, TRACK, BAND));
    for (let i = 1; i < seen.length; i += 1) {
      expect(seen[i]!).toBeLessThanOrEqual(seen[i - 1]!);
    }
  });
});
