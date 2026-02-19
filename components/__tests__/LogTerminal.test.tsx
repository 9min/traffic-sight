import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LogTerminal from "../dashboard/LogTerminal";
import type { TrafficEvent } from "@/lib/supabase/types";

function makeEvent(overrides: Partial<TrafficEvent> = {}): TrafficEvent {
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    src_ip: "192.168.1.1",
    src_country_code: "US",
    src_city: "New York",
    src_lat: 40.7128,
    src_lng: -74.006,
    dst_ip: "10.0.0.1",
    dst_country_code: "GB",
    dst_city: "London",
    dst_lat: 51.5074,
    dst_lng: -0.1278,
    protocol: "TCP",
    port: 443,
    packet_size: 1024,
    threat_level: 0,
    threat_type: null,
    status: "active",
    ...overrides,
  };
}

describe("LogTerminal", () => {
  it("should show waiting message when no events", () => {
    render(<LogTerminal events={[]} />);
    expect(screen.getByText("Waiting for traffic data...")).toBeInTheDocument();
  });

  it("should show entry count", () => {
    render(<LogTerminal events={[]} />);
    expect(screen.getByText("0 entries")).toBeInTheDocument();
  });

  it("should render terminal header", () => {
    render(<LogTerminal events={[]} />);
    expect(screen.getByText("Network Traffic Log")).toBeInTheDocument();
  });

  it("should render terminal prompt", () => {
    const { container } = render(<LogTerminal events={[]} />);
    expect(container.textContent).toContain("root@traffic-sight:~$");
  });

  it("should display event IP addresses", () => {
    const events = [makeEvent({ src_ip: "10.20.30.40", dst_ip: "50.60.70.80" })];
    render(<LogTerminal events={events} />);
    expect(screen.getByText("10.20.30.40")).toBeInTheDocument();
    expect(screen.getByText("50.60.70.80")).toBeInTheDocument();
  });

  it("should display protocol", () => {
    const events = [makeEvent({ protocol: "HTTPS" })];
    render(<LogTerminal events={events} />);
    expect(screen.getByText("HTTPS")).toBeInTheDocument();
  });

  it("should display port", () => {
    const events = [makeEvent({ port: 8080 })];
    render(<LogTerminal events={events} />);
    expect(screen.getByText(":8080")).toBeInTheDocument();
  });

  it("should display threat badge for threat events", () => {
    const events = [
      makeEvent({ threat_level: 3, threat_type: "DDoS Attack" }),
    ];
    render(<LogTerminal events={events} />);
    expect(screen.getByText(/DDoS Attack/)).toBeInTheDocument();
  });

  it("should not display threat badge for safe events", () => {
    const events = [makeEvent({ threat_level: 0, threat_type: null })];
    render(<LogTerminal events={events} />);
    expect(screen.queryByText("⚠")).not.toBeInTheDocument();
  });

  it("should render multiple events", () => {
    const events = [
      makeEvent({ src_ip: "1.1.1.1" }),
      makeEvent({ src_ip: "2.2.2.2" }),
      makeEvent({ src_ip: "3.3.3.3" }),
    ];
    render(<LogTerminal events={events} />);
    expect(screen.getByText("1.1.1.1")).toBeInTheDocument();
    expect(screen.getByText("2.2.2.2")).toBeInTheDocument();
    expect(screen.getByText("3.3.3.3")).toBeInTheDocument();
    expect(screen.getByText("3 entries")).toBeInTheDocument();
  });

  it("should format packet size", () => {
    const events = [makeEvent({ packet_size: 2048 })];
    render(<LogTerminal events={events} />);
    expect(screen.getByText("[2KB]")).toBeInTheDocument();
  });
});
