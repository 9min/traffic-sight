import { describe, it, expect } from "vitest";
import { randomCity, generateTrafficEvent, generateBatch } from "../traffic-generator";
import { CITIES, PROTOCOLS, THREAT_TYPES } from "../constants";

describe("randomCity", () => {
  it("should return a city from CITIES array", () => {
    const city = randomCity();
    expect(CITIES).toContainEqual(city);
  });

  it("should return different cities on multiple calls (probabilistic)", () => {
    const cities = new Set<string>();
    for (let i = 0; i < 100; i++) {
      cities.add(randomCity().city);
    }
    expect(cities.size).toBeGreaterThan(1);
  });
});

describe("generateTrafficEvent", () => {
  it("should return an object with all required fields", () => {
    const event = generateTrafficEvent();

    expect(event).toHaveProperty("src_ip");
    expect(event).toHaveProperty("src_country_code");
    expect(event).toHaveProperty("src_city");
    expect(event).toHaveProperty("src_lat");
    expect(event).toHaveProperty("src_lng");
    expect(event).toHaveProperty("dst_ip");
    expect(event).toHaveProperty("dst_country_code");
    expect(event).toHaveProperty("dst_city");
    expect(event).toHaveProperty("dst_lat");
    expect(event).toHaveProperty("dst_lng");
    expect(event).toHaveProperty("protocol");
    expect(event).toHaveProperty("port");
    expect(event).toHaveProperty("packet_size");
    expect(event).toHaveProperty("threat_level");
    expect(event).toHaveProperty("threat_type");
    expect(event).toHaveProperty("status");
  });

  it("should have valid IP addresses", () => {
    const event = generateTrafficEvent();
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    expect(event.src_ip).toMatch(ipRegex);
    expect(event.dst_ip).toMatch(ipRegex);
  });

  it("should have 2-letter country codes", () => {
    const event = generateTrafficEvent();
    expect(event.src_country_code).toMatch(/^[A-Z]{2}$/);
    expect(event.dst_country_code).toMatch(/^[A-Z]{2}$/);
  });

  it("should have valid coordinates", () => {
    const event = generateTrafficEvent();
    expect(event.src_lat).toBeGreaterThanOrEqual(-90);
    expect(event.src_lat).toBeLessThanOrEqual(90);
    expect(event.src_lng).toBeGreaterThanOrEqual(-180);
    expect(event.src_lng).toBeLessThanOrEqual(180);
    expect(event.dst_lat).toBeGreaterThanOrEqual(-90);
    expect(event.dst_lat).toBeLessThanOrEqual(90);
    expect(event.dst_lng).toBeGreaterThanOrEqual(-180);
    expect(event.dst_lng).toBeLessThanOrEqual(180);
  });

  it("should have source and destination be different cities", () => {
    // Run multiple times to be confident
    for (let i = 0; i < 50; i++) {
      const event = generateTrafficEvent();
      expect(event.src_city).not.toBe(event.dst_city);
    }
  });

  it("should use a valid protocol", () => {
    const event = generateTrafficEvent();
    expect([...PROTOCOLS]).toContain(event.protocol);
  });

  it("should have valid port number", () => {
    const event = generateTrafficEvent();
    expect(event.port).toBeGreaterThanOrEqual(0);
    expect(event.port).toBeLessThanOrEqual(65535);
  });

  it("should have packet_size between 64 and 65535", () => {
    for (let i = 0; i < 20; i++) {
      const event = generateTrafficEvent();
      expect(event.packet_size).toBeGreaterThanOrEqual(64);
      expect(event.packet_size).toBeLessThanOrEqual(65535);
    }
  });

  it("should have threat_level 0 for non-threat events", () => {
    // Generate many events and check non-threat ones
    for (let i = 0; i < 100; i++) {
      const event = generateTrafficEvent();
      if (event.threat_type === null) {
        expect(event.threat_level).toBe(0);
      }
    }
  });

  it("should have threat_level 1-5 and valid type for threat events", () => {
    // Generate until we find a threat
    let found = false;
    for (let i = 0; i < 200; i++) {
      const event = generateTrafficEvent();
      if (event.threat_level > 0) {
        expect(event.threat_level).toBeGreaterThanOrEqual(1);
        expect(event.threat_level).toBeLessThanOrEqual(5);
        expect(event.threat_type).not.toBeNull();
        expect([...THREAT_TYPES]).toContain(event.threat_type);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("should produce approximately 15% threats over many events", () => {
    let threatCount = 0;
    const total = 1000;
    for (let i = 0; i < total; i++) {
      const event = generateTrafficEvent();
      if (event.threat_level > 0) threatCount++;
    }
    const ratio = threatCount / total;
    // Allow ±8% tolerance
    expect(ratio).toBeGreaterThan(0.07);
    expect(ratio).toBeLessThan(0.23);
  });

  it("should always have status 'active'", () => {
    const event = generateTrafficEvent();
    expect(event.status).toBe("active");
  });
});

describe("generateBatch", () => {
  it("should generate the requested number of events", () => {
    expect(generateBatch(1)).toHaveLength(1);
    expect(generateBatch(5)).toHaveLength(5);
    expect(generateBatch(10)).toHaveLength(10);
  });

  it("should generate 0 events for count 0", () => {
    expect(generateBatch(0)).toHaveLength(0);
  });

  it("should generate unique events (different IPs)", () => {
    const batch = generateBatch(10);
    const srcIps = new Set(batch.map((e) => e.src_ip));
    // Very high probability of all being unique
    expect(srcIps.size).toBeGreaterThanOrEqual(5);
  });
});
