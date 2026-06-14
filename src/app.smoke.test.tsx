import { render, screen } from "@testing-library/react";

function SmokeView() {
  return <h1>No Zero</h1>;
}

describe("test harness", () => {
  it("renders React content", () => {
    render(<SmokeView />);

    expect(screen.getByRole("heading", { name: "No Zero" })).toBeVisible();
  });
});
