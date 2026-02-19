import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import { generateBatch } from "../lib/traffic-generator";

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

async function insertBatch(count: number) {
  const events = generateBatch(count);
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

  const interval = setInterval(async () => {
    const batchSize = faker.number.int({ min: 2, max: 5 });
    const inserted = await insertBatch(batchSize);
    totalGenerated += inserted;

    if (inserted > 0) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(
        `[${timestamp}] ✅ Inserted ${inserted} events (Total: ${totalGenerated})`
      );
    }
  }, 1000);

  process.on("SIGINT", () => {
    console.log(`\n\n🛑 Stopping... Total events generated: ${totalGenerated}`);
    clearInterval(interval);
    process.exit(0);
  });

  console.log("Press Ctrl+C to stop\n");
}

main().catch(console.error);
