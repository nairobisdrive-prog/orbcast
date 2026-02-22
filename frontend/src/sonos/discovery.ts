import type { SonosDevice } from '../types';

// ─── Mock Devices (Dev Mode) ──────────────────────────────────────────────────
export const MOCK_DEVICES: SonosDevice[] = [
  {
    id: 'sonos-living-room',
    name: 'Living Room',
    room: 'Living Room',
    ip: '192.168.1.101',
    port: 1400,
    status: 'online',
    volume: 45,
    isMuted: false,
    modelName: 'Sonos Era 300',
  },
  {
    id: 'sonos-kitchen',
    name: 'Kitchen',
    room: 'Kitchen',
    ip: '192.168.1.102',
    port: 1400,
    status: 'online',
    volume: 30,
    isMuted: false,
    modelName: 'Sonos Play:3',
  },
  {
    id: 'sonos-bedroom',
    name: 'Bedroom',
    room: 'Bedroom',
    ip: '192.168.1.103',
    port: 1400,
    status: 'offline',
    volume: 0,
    isMuted: true,
    modelName: 'Sonos Era 100',
  },
  {
    id: 'sonos-office',
    name: 'Office',
    room: 'Office',
    ip: '192.168.1.104',
    port: 1400,
    status: 'online',
    volume: 60,
    isMuted: false,
    modelName: 'Sonos Move 2',
  },
];

// ─── SSDP Discovery (Real — Requires Custom Dev Build with UDP support) ───────
export const SSDP_MULTICAST_ADDR = '239.255.255.250';
export const SSDP_PORT = 1900;
export const SSDP_SEARCH_MSG =
  'M-SEARCH * HTTP/1.1\r\n' +
  `HOST: ${SSDP_MULTICAST_ADDR}:${SSDP_PORT}\r\n` +
  'MAN: "ssdp:discover"\r\n' +
  'MX: 1\r\n' +
  'ST: urn:schemas-upnp-org:device:ZonePlayer:1\r\n\r\n';

/**
 * Parse a Sonos SSDP response into a partial device record.
 * Used by the real discovery module (custom build only).
 */
export function parseSsdpResponse(raw: string): Partial<SonosDevice> | null {
  const lines = raw.split('\r\n');
  const locationLine = lines.find((l) => l.toLowerCase().startsWith('location:'));
  if (!locationLine) return null;
  const location = locationLine.split(': ')[1]?.trim();
  if (!location) return null;

  try {
    const url = new URL(location);
    return {
      ip: url.hostname,
      port: parseInt(url.port) || 1400,
      status: 'online',
      id: url.hostname, // temporary, refined after XML fetch
      name: 'Sonos Speaker',
      room: 'Unknown Room',
      volume: 0,
      isMuted: false,
    };
  } catch {
    return null;
  }
}

/**
 * Discover Sonos devices.
 * In Expo managed workflow this returns mock devices.
 * In a custom dev build with react-native-udp, replace with real SSDP.
 */
export async function discoverDevices(
  onProgress?: (device: SonosDevice) => void
): Promise<SonosDevice[]> {
  // Simulate scanning delay
  await new Promise((r) => setTimeout(r, 2000));

  for (const device of MOCK_DEVICES) {
    await new Promise((r) => setTimeout(r, 400));
    onProgress?.(device);
  }

  return MOCK_DEVICES;
}
