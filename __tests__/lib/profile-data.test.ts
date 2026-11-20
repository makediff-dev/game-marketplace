import {
  PROFILE_STATUS_CONFIG,
  normalizeProfileStatus,
  parseProfileFilter,
  parseProfileTab,
} from "@/lib/profile-data";

describe("profile url params", () => {
  it("parses the tab with a goods fallback", () => {
    expect(parseProfileTab("purchases")).toBe("purchases");
    expect(parseProfileTab("sales")).toBe("sales");
    expect(parseProfileTab("products")).toBe("goods");
    expect(parseProfileTab(null)).toBe("goods");
    expect(parseProfileTab("junk")).toBe("goods");
  });

  it("parses the filter with an active fallback", () => {
    expect(parseProfileFilter("completed")).toBe("completed");
    expect(parseProfileFilter("disputed")).toBe("disputed");
    expect(parseProfileFilter(null)).toBe("active");
  });

  it("normalizes unknown statuses to pending", () => {
    expect(normalizeProfileStatus("dispute")).toBe("dispute");
    expect(normalizeProfileStatus("whatever")).toBe("pending");
  });

  it("labels every status in Russian", () => {
    for (const { label } of Object.values(PROFILE_STATUS_CONFIG)) {
      expect(label).toMatch(/[А-Яа-яЁё]/);
    }
  });
});
