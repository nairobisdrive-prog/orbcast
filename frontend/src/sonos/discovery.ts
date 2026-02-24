import type { SonosDevice } from '../types';

// ─── Mock Devices (used when react-native-udp is unavailable) ─────────────────
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

// ─── SSDP constants ───────────────────────────────────────────────────────────
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
      id: url.hostname,
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
 * Fetch device description XML from a Sonos device and extract its room name / model.
 */
async function fetchDeviceDescription(ip: string, port: number): Promise<Partial<SonosDevice>> {
  try {
    const res = await fetch(`http://${ip}:${port}/xml/device_description.xml`, { signal: AbortSignal.timeout(3000) });
    const xml = await res.text();
    const roomMatch = xml.match(/<roomName>([^<]+)<\/roomName>/);
    const modelMatch = xml.match(/<modelName>([^<]+)<\/modelName>/);
    const nameMatch = xml.match(/<deviceType>[^<]*ZonePlayer[^<]*<\/deviceType>/);
    return {
      name: roomMatch?.[1] ?? 'Sonos Speaker',
      room: roomMatch?.[1] ?? 'Unknown Room',
      modelName: modelMatch?.[1],
    };
  } catch {
    return {};
  }
}

/**
 * Real SSDP discovery using react-native-udp (custom dev build only).
 * Falls back to mock devices in Expo Go or managed workflow.
 */
async function discoverReal(onProgress?: (device: SonosDevice) => void): Promise<SonosDevice[]> {
  // react-native-udp is only available in a custom dev build / EAS build
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const UdpSocket = require('react-native-udp').default;

  return new Promise((resolve) => {
    const found: Map<string, SonosDevice> = new Map();
    const TIMEOUT_MS = 5000;

    const socket = UdpSocket.createSocket({ type: 'udp4', reusePort: true });

    const done = () => {
      try { socket.close(); } catch { /* ignore */ }
      resolve(Array.from(found.values()));
    };

    const timer = setTimeout(done, TIMEOUT_MS);

    socket.on('error', (err: any) => {
      console.warn('[SSDP] UDP socket error:', err.message);
      clearTimeout(timer);
      done();
    });

    socket.on('message', async (msg: Buffer) => {
      const raw = msg.toString();
      if (!raw.startsWith('HTTP/1.1 200') && !raw.includes('ZonePlayer')) return;

      const partial = parseSsdpResponse(raw);
      if (!partial?.ip || found.has(partial.ip)) return;

      const description = await fetchDeviceDescription(partial.ip, partial.port ?? 1400);
      const device: SonosDevice = {
        id: `sonos-${partial.ip}`,
        name: description.name ?? partial.name ?? 'Sonos Speaker',
        room: description.room ?? partial.room ?? 'Unknown Room',
        ip: partial.ip,
        port: partial.port ?? 1400,
        status: 'online',
        volume: 0,
        isMuted: false,
        modelName: description.modelName,
      };

      found.set(partial.ip, device);
      onProgress?.(device);
    });

    socket.bind(0, () => {
      socket.send(
        Buffer.from(SSDP_SEARCH_MSG),
        0,
        SSDP_SEARCH_MSG.length,
        SSDP_PORT,
        SSDP_MULTICAST_ADDR,
        (err: any) => {
          if (err) console.warn('[SSDP] send error:', err.message);
        }
      );
    });
  });
}

/**
 * Discover Sonos devices.
 *
 * - Custom dev build (react-native-udp available): Real SSDP scan
 * - Expo Go / managed workflow: Returns mock devices for UI testing
 */
export async function discoverDevices(
  onProgress?: (device: SonosDevice) => void
): Promise<SonosDevice[]> {
  try {
    // Attempt real SSDP discovery (requires react-native-udp)
    const devices = await discoverReal(onProgress);
    if (devices.length > 0) return devices;
    // If scan found nothing, fall through to mock
  } catch {
    // react-native-udp not available (Expo Go / managed workflow)
    console.log('[Discovery] react-native-udp not available, using mock devices');
  }

  // Mock fallback — staggered to simulate scanning UX
  await new Promise((r) => setTimeout(r, 1500));
  for (const device of MOCK_DEVICES) {
    await new Promise((r) => setTimeout(r, 300));
    onProgress?.(device);
  }
  return MOCK_DEVICES;
}
