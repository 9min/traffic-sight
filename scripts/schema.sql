-- Traffic Sight - Supabase Database Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE traffic_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  src_ip INET NOT NULL,
  src_country_code CHAR(2) NOT NULL,
  src_city VARCHAR(100),
  src_lat DOUBLE PRECISION NOT NULL,
  src_lng DOUBLE PRECISION NOT NULL,
  dst_ip INET NOT NULL,
  dst_country_code CHAR(2) NOT NULL,
  dst_city VARCHAR(100),
  dst_lat DOUBLE PRECISION NOT NULL,
  dst_lng DOUBLE PRECISION NOT NULL,
  protocol VARCHAR(10) NOT NULL,
  port INTEGER,
  packet_size INTEGER NOT NULL,
  threat_level SMALLINT DEFAULT 0,
  threat_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active'
);

-- Indexes for performance
CREATE INDEX idx_traffic_created_at ON traffic_events (created_at DESC);
CREATE INDEX idx_traffic_threat ON traffic_events (threat_level) WHERE threat_level > 0;

-- Enable Realtime for this table
-- Go to Supabase Dashboard > Database > Replication
-- and enable realtime for the traffic_events table

-- Optional: Auto-cleanup old events (keep last 10000)
-- CREATE OR REPLACE FUNCTION cleanup_old_events()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   DELETE FROM traffic_events
--   WHERE id NOT IN (
--     SELECT id FROM traffic_events
--     ORDER BY created_at DESC
--     LIMIT 10000
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
