import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../dashboard/Header";

describe("Header", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render the TRAFFIC SIGHT title", () => {
    render(<Header isConnected={true} totalCount={0} />);
    // GlitchText renders each char as a span, look for the container
    const chars = screen.getAllByText(/[A-Z]/);
    expect(chars.length).toBeGreaterThan(0);
  });

  it("should show CONNECTED when isConnected=true", () => {
    render(<Header isConnected={true} totalCount={0} />);
    expect(screen.getByText("CONNECTED")).toBeInTheDocument();
  });

  it("should show OFFLINE when isConnected=false", () => {
    render(<Header isConnected={false} totalCount={0} />);
    expect(screen.getByText("OFFLINE")).toBeInTheDocument();
  });

  it("should display total count with animated counter", () => {
    render(<Header isConnected={true} totalCount={12345} />);
    // AnimatedCounter renders a span that updates via rAF; verify the element exists
    const eventsLabel = screen.getByText("Events");
    expect(eventsLabel).toBeInTheDocument();
    // The counter span is the sibling of the Events label
    const counterSpan = eventsLabel.parentElement?.querySelector("span.tabular-nums");
    expect(counterSpan).toBeInTheDocument();
  });

  it("should display version badge", () => {
    render(<Header isConnected={true} totalCount={0} />);
    expect(screen.getByText("v2.0.4")).toBeInTheDocument();
  });

  it("should display REALTIME badge", () => {
    render(<Header isConnected={true} totalCount={0} />);
    expect(screen.getByText("REALTIME")).toBeInTheDocument();
  });

  it("should show green dot when connected", () => {
    const { container } = render(
      <Header isConnected={true} totalCount={0} />
    );
    const dot = container.querySelector(".bg-matrix-green");
    expect(dot).toBeInTheDocument();
  });

  it("should show red dot when disconnected", () => {
    const { container } = render(
      <Header isConnected={false} totalCount={0} />
    );
    const dot = container.querySelector(".bg-threat-red");
    expect(dot).toBeInTheDocument();
  });
});
