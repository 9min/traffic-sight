export interface CityCoord {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export const CITIES: CityCoord[] = [
  { city: "New York", country: "United States", countryCode: "US", lat: 40.7128, lng: -74.006 },
  { city: "Los Angeles", country: "United States", countryCode: "US", lat: 34.0522, lng: -118.2437 },
  { city: "Chicago", country: "United States", countryCode: "US", lat: 41.8781, lng: -87.6298 },
  { city: "London", country: "United Kingdom", countryCode: "GB", lat: 51.5074, lng: -0.1278 },
  { city: "Paris", country: "France", countryCode: "FR", lat: 48.8566, lng: 2.3522 },
  { city: "Berlin", country: "Germany", countryCode: "DE", lat: 52.52, lng: 13.405 },
  { city: "Tokyo", country: "Japan", countryCode: "JP", lat: 35.6762, lng: 139.6503 },
  { city: "Seoul", country: "South Korea", countryCode: "KR", lat: 37.5665, lng: 126.978 },
  { city: "Beijing", country: "China", countryCode: "CN", lat: 39.9042, lng: 116.4074 },
  { city: "Shanghai", country: "China", countryCode: "CN", lat: 31.2304, lng: 121.4737 },
  { city: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3521, lng: 103.8198 },
  { city: "Sydney", country: "Australia", countryCode: "AU", lat: -33.8688, lng: 151.2093 },
  { city: "Mumbai", country: "India", countryCode: "IN", lat: 19.076, lng: 72.8777 },
  { city: "Dubai", country: "UAE", countryCode: "AE", lat: 25.2048, lng: 55.2708 },
  { city: "Moscow", country: "Russia", countryCode: "RU", lat: 55.7558, lng: 37.6173 },
  { city: "São Paulo", country: "Brazil", countryCode: "BR", lat: -23.5505, lng: -46.6333 },
  { city: "Toronto", country: "Canada", countryCode: "CA", lat: 43.6532, lng: -79.3832 },
  { city: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.3676, lng: 4.9041 },
  { city: "Stockholm", country: "Sweden", countryCode: "SE", lat: 59.3293, lng: 18.0686 },
  { city: "Frankfurt", country: "Germany", countryCode: "DE", lat: 50.1109, lng: 8.6821 },
  { city: "Hong Kong", country: "Hong Kong", countryCode: "HK", lat: 22.3193, lng: 114.1694 },
  { city: "Taipei", country: "Taiwan", countryCode: "TW", lat: 25.033, lng: 121.5654 },
  { city: "Jakarta", country: "Indonesia", countryCode: "ID", lat: -6.2088, lng: 106.8456 },
  { city: "Istanbul", country: "Turkey", countryCode: "TR", lat: 41.0082, lng: 28.9784 },
  { city: "Cape Town", country: "South Africa", countryCode: "ZA", lat: -33.9249, lng: 18.4241 },
  { city: "Mexico City", country: "Mexico", countryCode: "MX", lat: 19.4326, lng: -99.1332 },
  { city: "Buenos Aires", country: "Argentina", countryCode: "AR", lat: -34.6037, lng: -58.3816 },
  { city: "Warsaw", country: "Poland", countryCode: "PL", lat: 52.2297, lng: 21.0122 },
  { city: "Helsinki", country: "Finland", countryCode: "FI", lat: 60.1699, lng: 24.9384 },
  { city: "Johannesburg", country: "South Africa", countryCode: "ZA", lat: -26.2041, lng: 28.0473 },
  { city: "Bangkok", country: "Thailand", countryCode: "TH", lat: 13.7563, lng: 100.5018 },
  { city: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", lat: 3.139, lng: 101.6869 },
];

export const PROTOCOLS = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS", "SSH", "FTP", "SMTP", "TLS"] as const;
export type Protocol = (typeof PROTOCOLS)[number];

export const PROTOCOL_PORTS: Record<string, number> = {
  HTTP: 80,
  HTTPS: 443,
  DNS: 53,
  SSH: 22,
  FTP: 21,
  SMTP: 25,
  TCP: 8080,
  UDP: 5060,
  ICMP: 0,
  TLS: 443,
};

export const THREAT_TYPES = [
  "DDoS Attack",
  "SQL Injection",
  "Port Scan",
  "Brute Force",
  "XSS Attack",
  "Man-in-the-Middle",
  "Malware C2",
  "Data Exfiltration",
  "Ransomware",
  "Zero-Day Exploit",
] as const;

export type ThreatType = (typeof THREAT_TYPES)[number];

export const MAX_ARCS = 50;
export const MAX_LOG_ENTRIES = 50;
export const MAX_THREAT_ENTRIES = 50;
export const ROLLING_WINDOW = 200;

export const ARC_TTL_MS = 6000;
export const RING_TTL_MS = 3000;

export const BANDWIDTH_BUCKET_COUNT = 10;
export const BANDWIDTH_WINDOW_SEC = 30;
export const BANDWIDTH_BUCKET_SEC = 3;
