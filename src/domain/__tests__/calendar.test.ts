import { calendarGridRange, projectCalendarDays } from "../calendar";
import { buildActivity, buildTrack } from "../../test/builders";

describe("calendar projection", () => {
  it("creates complete Monday and Sunday based grids", () => {
    expect(calendarGridRange("2026-06", "monday")).toEqual({
      from: "2026-06-01",
      to: "2026-07-05",
    });
    expect(calendarGridRange("2026-06", "sunday")).toEqual({
      from: "2026-05-31",
      to: "2026-07-04",
    });
  });

  it("classifies active, missed, future, and out-of-range dates", () => {
    const track = buildTrack();
    const days = projectCalendarDays({
      month: "2026-06",
      weekStartsOn: "monday",
      today: "2026-06-14",
      challengeRange: { from: "2026-06-10", to: "2026-12-31" },
      activities: [buildActivity({ date: "2026-06-12", bonusPoints: 1 })],
      tracks: [track],
    });
    expect(days.find((day) => day.date === "2026-06-09")?.state).toBe(
      "out_of_range",
    );
    expect(days.find((day) => day.date === "2026-06-11")?.state).toBe("missed");
    expect(days.find((day) => day.date === "2026-06-12")).toMatchObject({
      state: "active",
      points: 3,
    });
    expect(days.find((day) => day.date === "2026-06-15")?.state).toBe("future");
  });

  it("filters activity and qualification by project", () => {
    const english = buildTrack();
    const korean = buildTrack({ id: "korean", slug: "korean", name: "Korean" });
    const days = projectCalendarDays({
      month: "2026-06",
      weekStartsOn: "monday",
      today: "2026-06-14",
      challengeRange: { from: "2026-06-01", to: "2026-12-31" },
      activities: [
        buildActivity({ id: "one", date: "2026-06-12", trackId: "english" }),
        buildActivity({ id: "two", date: "2026-06-12", trackId: "korean" }),
      ],
      tracks: [english, korean],
      trackId: "korean",
    });
    expect(days.find((day) => day.date === "2026-06-12")).toMatchObject({
      state: "active",
      points: 2,
      trackIds: ["korean"],
    });
  });
});
