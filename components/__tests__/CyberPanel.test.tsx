import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CyberPanel from "../ui/CyberPanel";

describe("CyberPanel", () => {
  it("should render children", () => {
    render(<CyberPanel>Hello World</CyberPanel>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("should render title when provided", () => {
    render(<CyberPanel title="TEST TITLE">Content</CyberPanel>);
    expect(screen.getByText("TEST TITLE")).toBeInTheDocument();
  });

  it("should not render title bar when title is omitted", () => {
    const { container } = render(<CyberPanel>Content</CyberPanel>);
    const titleBars = container.querySelectorAll(".tracking-widest");
    expect(titleBars).toHaveLength(0);
  });

  it("should apply green variant by default", () => {
    const { container } = render(<CyberPanel>Content</CyberPanel>);
    const panel = container.firstElementChild;
    expect(panel?.className).toContain("neon-glow-green");
  });

  it("should apply cyan variant", () => {
    const { container } = render(
      <CyberPanel variant="cyan">Content</CyberPanel>
    );
    const panel = container.firstElementChild;
    expect(panel?.className).toContain("neon-glow-cyan");
  });

  it("should apply red variant", () => {
    const { container } = render(
      <CyberPanel variant="red">Content</CyberPanel>
    );
    const panel = container.firstElementChild;
    expect(panel?.className).toContain("neon-glow-red");
  });

  it("should apply pulse animation when pulse=true", () => {
    const { container } = render(<CyberPanel pulse>Content</CyberPanel>);
    const panel = container.firstElementChild;
    expect(panel?.className).toContain("cyber-border-pulse");
  });

  it("should not apply pulse animation by default", () => {
    const { container } = render(<CyberPanel>Content</CyberPanel>);
    const panel = container.firstElementChild;
    expect(panel?.className).not.toContain("cyber-border-pulse");
  });

  it("should render 4 corner decorations", () => {
    const { container } = render(<CyberPanel>Content</CyberPanel>);
    // Corners have both border-t/border-b and border-l/border-r
    const corners = container.querySelectorAll(".absolute.w-3.h-3");
    expect(corners).toHaveLength(4);
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CyberPanel className="my-custom-class">Content</CyberPanel>
    );
    const panel = container.firstElementChild;
    expect(panel?.className).toContain("my-custom-class");
  });
});
