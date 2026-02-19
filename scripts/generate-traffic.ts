import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import { CITIES, PROTOCOLS, PROTOCOL_PORTS, THREAT_TYPES } from "../lib/constants";

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function randomCity() {
  return CITIES[Math.floor(Math.random() * CITIES.length)];
}

function generateTrafficEvent() {
  const src = randomCity();
  let dst = randomCity();
  // Ensure src and dst are different
  while (dst.city === src.city) {
    dst = randomCity();
  }

  const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
  const port = PROTOCOL_PORTS[protocol] || faker.number.int({ min: 1024, max: 65535 });

  // 15% chance of threat
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
    status: "active",
  };
}

async function generateBatch(count: number) {
  const events = Array.from({ length: count }, generateTrafficEvent);

  const { error } = await supabase.from("traffic_events").insert(events);
  if (error) {
    console.error("❌ Insert error:", error.message);
    return 0;
  }
  return count;
}

async function main() {
  console.log("🚀 Traffic Sight - Data Generator");
  console.log("================================");
  console.log(`📡 Supabase URL: ${supabaseUrl}`);
  console.log("⏳ Generating traffic events...\n");

  let totalGenerated = 0;

  // Generate continuously
  const interval = setInterval(async () => {
    const batchSize = faker.number.int({ min: 2, max: 5 });
    const inserted = await generateBatch(batchSize);
    totalGenerated += inserted;

    if (inserted > 0) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(
        `[${timestamp}] ✅ Inserted ${inserted} events (Total: ${totalGenerated})`
      );
    }
  }, 1000);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log(`\n\n🛑 Stopping... Total events generated: ${totalGenerated}`);
    clearInterval(interval);
    process.exit(0);
  });

  console.log("Press Ctrl+C to stop\n");
}

main().catch(console.error);
