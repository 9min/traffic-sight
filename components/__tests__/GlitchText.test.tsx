import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import GlitchText from "../effects/GlitchText";

describe("GlitchText", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render the text content", () => {
    render(<GlitchText text="HELLO" />);
    // Each character is rendered as a span + 2 glitch layers
    const chars = screen.getAllByText("H");
    expect(chars.length).toBeGreaterThanOrEqual(1);
  });

  it("should render individual character spans", () => {
    const { container } = render(<GlitchText text="ABC" />);
    const charSpans = container.querySelectorAll(".glitch-char");
    expect(charSpans).toHaveLength(3);
    expect(charSpans[0].textContent).toBe("A");
    expect(charSpans[1].textContent).toBe("B");
    expect(charSpans[2].textContent).toBe("C");
  });

  it("should render glitch overlay layers", () => {
    const { container } = render(<GlitchText text="TEST" />);
    // 2 absolute-positioned glitch layers with aria-hidden
    const layers = container.querySelectorAll('[aria-hidden="true"]');
    expect(layers).toHaveLength(2);
  });

  it("should convert spaces to non-breaking spaces", () => {
    const { container } = render(<GlitchText text="A B" />);
    const charSpans = container.querySelectorAll(".glitch-char");
    expect(charSpans[1].textContent).toBe("\u00A0");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <GlitchText text="X" className="my-class" />
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("my-class");
  });

  it("should handle empty text", () => {
    const { container } = render(<GlitchText text="" />);
    const charSpans = container.querySelectorAll(".glitch-char");
    expect(charSpans).toHaveLength(0);
  });
});
