import {
  isLocalDate,
  shiftLocalDate,
  startOfConfiguredWeek,
  toLocalDate,
} from "../dates";

describe("local dates", () => {
  it("rejects impossible calendar dates", () => {
    expect(isLocalDate("2026-02-29")).toBe(false);
    expect(isLocalDate("2024-02-29")).toBe(true);
  });

  it("uses the configured time zone", () => {
    const instant = new Date("2026-06-14T18:00:00.000Z");
    expect(toLocalDate(instant, "Asia/Jakarta")).toBe("2026-06-15");
    expect(toLocalDate(instant, "America/New_York")).toBe("2026-06-14");
  });

  it("uses calendar arithmetic across leap days and DST", () => {
    expect(shiftLocalDate("2024-02-28", 1)).toBe("2024-02-29");
    expect(shiftLocalDate("2026-03-08", 1)).toBe("2026-03-09");
  });

  it("supports Monday and Sunday starts", () => {
    expect(startOfConfiguredWeek("2026-06-14", "monday")).toBe("2026-06-08");
    expect(startOfConfiguredWeek("2026-06-14", "sunday")).toBe("2026-06-14");
  });
});
