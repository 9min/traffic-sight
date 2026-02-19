export interface TrafficEvent {
  id: string;
  created_at: string;
  src_ip: string;
  src_country_code: string;
  src_city: string | null;
  src_lat: number;
  src_lng: number;
  dst_ip: string;
  dst_country_code: string;
  dst_city: string | null;
  dst_lat: number;
  dst_lng: number;
  protocol: string;
  port: number | null;
  packet_size: number;
  threat_level: number;
  threat_type: string | null;
  status: string;
}

export interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  stroke: number;
  id: string;
}

export interface Database {
  public: {
    Tables: {
      traffic_events: {
        Row: TrafficEvent;
        Insert: Omit<TrafficEvent, "id" | "created_at">;
        Update: Partial<Omit<TrafficEvent, "id">>;
      };
    };
  };
}
