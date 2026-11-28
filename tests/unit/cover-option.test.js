import { describe, expect, it } from "vitest";
import CoverOption from "../../app/_shared/CoverOption";

describe("CoverOption", () => {
  it("provides a non-empty collection of cover image URLs", () => {
    expect(CoverOption.length).toBeGreaterThan(0);
    expect(CoverOption.every((cover) => typeof cover.imageUrl === "string")).toBe(true);
    expect(CoverOption.every((cover) => cover.imageUrl.startsWith("https://"))).toBe(true);
  });

  it("keeps cover URLs unique", () => {
    const urls = CoverOption.map((cover) => cover.imageUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
