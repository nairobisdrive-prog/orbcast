import {
  sendSoapCommand,
  buildDIDLMetadata,
  xmlEscape,
  AVTRANSPORT_SERVICE,
  RENDERING_CONTROL_SERVICE,
  AVTRANSPORT_PATH,
  RENDERING_PATH,
} from './soapClient';
import type { SonosDevice } from '../types';

// ── Production mode ───────────────────────────────────────────────────────────
// Set to true ONLY during Expo Go / managed workflow demo (no real Sonos commands)
// Set to false when testing on a local network with real Sonos hardware
const DEV_MODE = false;

/**
 * Set the stream URL on a Sonos device (AVTransport).
 * Includes proper DIDL-Lite XML metadata so Sonos treats the URL as an MP3 radio stream.
 */
export async function setAVTransportURI(
  device: SonosDevice,
  streamUrl: string
): Promise<void> {
  if (DEV_MODE) {
    console.log(`[Sonos MOCK] SetAVTransportURI → ${device.name}: ${streamUrl}`);
    return;
  }
  const metadata = buildDIDLMetadata('OrbCast', streamUrl);
  await sendSoapCommand(device.ip, device.port, AVTRANSPORT_PATH, AVTRANSPORT_SERVICE, 'SetAVTransportURI', {
    InstanceID: 0,
    CurrentURI: streamUrl,
    CurrentURIMetaData: metadata,
  });
}

/**
 * Start playback on a Sonos device.
 */
export async function play(device: SonosDevice): Promise<void> {
  if (DEV_MODE) {
    console.log(`[Sonos MOCK] Play → ${device.name}`);
    return;
  }
  await sendSoapCommand(device.ip, device.port, AVTRANSPORT_PATH, AVTRANSPORT_SERVICE, 'Play', {
    InstanceID: 0,
    Speed: 1,
  });
}

/**
 * Stop playback on a Sonos device.
 */
export async function stop(device: SonosDevice): Promise<void> {
  if (DEV_MODE) {
    console.log(`[Sonos MOCK] Stop → ${device.name}`);
    return;
  }
  await sendSoapCommand(device.ip, device.port, AVTRANSPORT_PATH, AVTRANSPORT_SERVICE, 'Stop', {
    InstanceID: 0,
  });
}

/**
 * Set volume on a Sonos device (0..1 → 0..100 internally).
 */
export async function setVolume(device: SonosDevice, volume: number): Promise<void> {
  if (DEV_MODE) {
    console.log(`[Sonos MOCK] SetVolume → ${device.name}: ${Math.round(volume * 100)}`);
    return;
  }
  await sendSoapCommand(device.ip, device.port, RENDERING_PATH, RENDERING_CONTROL_SERVICE, 'SetVolume', {
    InstanceID: 0,
    Channel: 'Master',
    DesiredVolume: Math.round(volume * 100),
  });
}

/**
 * Start casting: set URI (with MP3 metadata) → brief pause → play.
 */
export async function startCasting(device: SonosDevice, streamUrl: string): Promise<void> {
  await setAVTransportURI(device, streamUrl);
  await new Promise((r) => setTimeout(r, 500));
  await play(device);
}

/**
 * Run a handshake test — checks if the device responds to a GetVolume command.
 */
export async function handshakeTest(device: SonosDevice): Promise<string> {
  if (DEV_MODE) {
    await new Promise((r) => setTimeout(r, 800));
    return `MOCK: ${device.name} (${device.ip}:${device.port}) — handshake OK`;
  }
  try {
    await sendSoapCommand(device.ip, device.port, RENDERING_PATH, RENDERING_CONTROL_SERVICE, 'GetVolume', {
      InstanceID: 0,
      Channel: 'Master',
    });
    return `${device.name} (${device.ip}:${device.port}) — handshake OK`;
  } catch (e: any) {
    return `${device.name} — FAILED: ${e.message}`;
  }
}
