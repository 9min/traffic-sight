import { describe, it, expect } from "vitest";
import {
  CITIES,
  PROTOCOLS,
  PROTOCOL_PORTS,
  THREAT_TYPES,
  MAX_ARCS,
  MAX_LOG_ENTRIES,
  MAX_THREAT_ENTRIES,
  ROLLING_WINDOW,
  ARC_TTL_MS,
  RING_TTL_MS,
  BANDWIDTH_BUCKET_COUNT,
  BANDWIDTH_WINDOW_SEC,
  BANDWIDTH_BUCKET_SEC,
} from "../constants";

describe("CITIES", () => {
  it("should have at least 30 cities", () => {
    expect(CITIES.length).toBeGreaterThanOrEqual(30);
  });

  it("should have valid coordinates for every city", () => {
    CITIES.forEach((city) => {
      expect(city.lat).toBeGreaterThanOrEqual(-90);
      expect(city.lat).toBeLessThanOrEqual(90);
      expect(city.lng).toBeGreaterThanOrEqual(-180);
      expect(city.lng).toBeLessThanOrEqual(180);
    });
  });

  it("should have 2-letter country codes", () => {
    CITIES.forEach((city) => {
      expect(city.countryCode).toMatch(/^[A-Z]{2}$/);
    });
  });

  it("should have non-empty city and country names", () => {
    CITIES.forEach((city) => {
      expect(city.city.length).toBeGreaterThan(0);
      expect(city.country.length).toBeGreaterThan(0);
    });
  });

  it("should not have duplicate city+countryCode combinations", () => {
    const keys = CITIES.map((c) => `${c.city}-${c.countryCode}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});

describe("PROTOCOLS", () => {
  it("should include common network protocols", () => {
    expect(PROTOCOLS).toContain("TCP");
    expect(PROTOCOLS).toContain("UDP");
    expect(PROTOCOLS).toContain("HTTPS");
    expect(PROTOCOLS).toContain("DNS");
    expect(PROTOCOLS).toContain("SSH");
  });

  it("should have matching port entries", () => {
    PROTOCOLS.forEach((proto) => {
      expect(PROTOCOL_PORTS).toHaveProperty(proto);
    });
  });
});

describe("PROTOCOL_PORTS", () => {
  it("should have correct well-known ports", () => {
    expect(PROTOCOL_PORTS.HTTP).toBe(80);
    expect(PROTOCOL_PORTS.HTTPS).toBe(443);
    expect(PROTOCOL_PORTS.DNS).toBe(53);
    expect(PROTOCOL_PORTS.SSH).toBe(22);
    expect(PROTOCOL_PORTS.FTP).toBe(21);
    expect(PROTOCOL_PORTS.SMTP).toBe(25);
  });

  it("should have non-negative port numbers", () => {
    Object.values(PROTOCOL_PORTS).forEach((port) => {
      expect(port).toBeGreaterThanOrEqual(0);
      expect(port).toBeLessThanOrEqual(65535);
    });
  });
});

describe("THREAT_TYPES", () => {
  it("should have at least 5 threat types", () => {
    expect(THREAT_TYPES.length).toBeGreaterThanOrEqual(5);
  });

  it("should include common attack types", () => {
    const types = [...THREAT_TYPES];
    expect(types).toContain("DDoS Attack");
    expect(types).toContain("SQL Injection");
    expect(types).toContain("Port Scan");
  });

  it("should have no duplicates", () => {
    const unique = new Set(THREAT_TYPES);
    expect(unique.size).toBe(THREAT_TYPES.length);
  });
});

describe("Window size constants", () => {
  it("should have sensible rolling window values", () => {
    expect(ROLLING_WINDOW).toBeGreaterThan(0);
    expect(MAX_ARCS).toBeGreaterThan(0);
    expect(MAX_LOG_ENTRIES).toBeGreaterThan(0);
    expect(MAX_THREAT_ENTRIES).toBeGreaterThan(0);
  });

  it("should have MAX_ARCS <= ROLLING_WINDOW", () => {
    expect(MAX_ARCS).toBeLessThanOrEqual(ROLLING_WINDOW);
  });

  it("should have MAX_THREAT_ENTRIES <= ROLLING_WINDOW", () => {
    expect(MAX_THREAT_ENTRIES).toBeLessThanOrEqual(ROLLING_WINDOW);
  });
});

describe("TTL constants", () => {
  it("should have positive arc TTL", () => {
    expect(ARC_TTL_MS).toBeGreaterThan(0);
  });

  it("should have positive ring TTL", () => {
    expect(RING_TTL_MS).toBeGreaterThan(0);
  });

  it("should have arc TTL >= ring TTL", () => {
    expect(ARC_TTL_MS).toBeGreaterThanOrEqual(RING_TTL_MS);
  });
});

describe("Bandwidth constants", () => {
  it("should have positive bucket count", () => {
    expect(BANDWIDTH_BUCKET_COUNT).toBeGreaterThan(0);
  });

  it("should have bucket count * bucket sec equal window sec", () => {
    expect(BANDWIDTH_BUCKET_COUNT * BANDWIDTH_BUCKET_SEC).toBe(BANDWIDTH_WINDOW_SEC);
  });

  it("should have positive window and bucket durations", () => {
    expect(BANDWIDTH_WINDOW_SEC).toBeGreaterThan(0);
    expect(BANDWIDTH_BUCKET_SEC).toBeGreaterThan(0);
  });
});
