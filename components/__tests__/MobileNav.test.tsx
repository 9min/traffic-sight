import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MobileNav from "../dashboard/MobileNav";
import type { TrafficStats } from "@/hooks/useTrafficStats";

const emptyStats: TrafficStats = {
  totalPackets: 0,
  totalBandwidth: 0,
  protocolDistribution: {},
  countryDistribution: {},
  threatCount: 0,
  threatsByType: {},
  avgThreatLevel: 0,
  bandwidthHistory: [],
  packetsPerSecond: 0,
};

describe("MobileNav", () => {
  it("should render all three tabs", () => {
    render(
      <MobileNav
        stats={emptyStats}
        threats={[]}
        globeSlot={<div data-testid="globe">Globe</div>}
      />
    );
    expect(screen.getByText("GLOBE")).toBeInTheDocument();
    expect(screen.getByText("STATS")).toBeInTheDocument();
    expect(screen.getByText("THREATS")).toBeInTheDocument();
  });

  it("should show globe content by default", () => {
    render(
      <MobileNav
        stats={emptyStats}
        threats={[]}
        globeSlot={<div data-testid="globe">Globe Content</div>}
      />
    );
    expect(screen.getByTestId("globe")).toBeInTheDocument();
  });

  it("should switch to stats tab on click", () => {
    render(
      <MobileNav
        stats={emptyStats}
        threats={[]}
        globeSlot={<div data-testid="globe">Globe</div>}
      />
    );

    fireEvent.click(screen.getByText("STATS"));
    // Stats panel renders "OVERVIEW" CyberPanel title
    expect(screen.getByText("OVERVIEW")).toBeInTheDocument();
    // Globe should be hidden
    expect(screen.queryByTestId("globe")).not.toBeInTheDocument();
  });

  it("should switch to threats tab on click", () => {
    render(
      <MobileNav
        stats={emptyStats}
        threats={[]}
        globeSlot={<div data-testid="globe">Globe</div>}
      />
    );

    fireEvent.click(screen.getByText("THREATS"));
    expect(screen.getByText("THREAT LEVEL")).toBeInTheDocument();
    expect(screen.queryByTestId("globe")).not.toBeInTheDocument();
  });

  it("should switch back to globe tab", () => {
    render(
      <MobileNav
        stats={emptyStats}
        threats={[]}
        globeSlot={<div data-testid="globe">Globe</div>}
      />
    );

    fireEvent.click(screen.getByText("STATS"));
    fireEvent.click(screen.getByText("GLOBE"));
    expect(screen.getByTestId("globe")).toBeInTheDocument();
  });
});
