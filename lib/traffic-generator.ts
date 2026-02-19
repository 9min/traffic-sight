import { faker } from "@faker-js/faker";
import { CITIES, PROTOCOLS, PROTOCOL_PORTS, THREAT_TYPES } from "./constants";

export function randomCity() {
  return CITIES[Math.floor(Math.random() * CITIES.length)];
}

export function generateTrafficEvent() {
  const src = randomCity();
  let dst = randomCity();
  while (dst.city === src.city) {
    dst = randomCity();
  }

  const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
  const port = PROTOCOL_PORTS[protocol] || faker.number.int({ min: 1024, max: 65535 });

  const isThreat = Math.random() < 0.15;
  const threatLevel = isThreat ? faker.number.int({ min: 1, max: 5 }) : 0;
  const threatType = isThreat
    ? THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)]
    : null;

  return {
    src_ip: faker.internet.ipv4(),
    src_country_code: src.countryCode,
    src_city: src.city,
    src_lat: src.lat,
    src_lng: src.lng,
    dst_ip: faker.internet.ipv4(),
    dst_country_code: dst.countryCode,
    dst_city: dst.city,
    dst_lat: dst.lat,
    dst_lng: dst.lng,
    protocol,
    port,
    packet_size: faker.number.int({ min: 64, max: 65535 }),
    threat_level: threatLevel,
    threat_type: threatType,
    status: "active" as const,
  };
}

export function generateBatch(count: number) {
  return Array.from({ length: count }, generateTrafficEvent);
}
