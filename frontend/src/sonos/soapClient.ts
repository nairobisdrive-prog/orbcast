/**
 * Minimal UPnP/SOAP client for Sonos control.
 * Builds and sends SOAP envelopes to Sonos AVTransport and RenderingControl services.
 */

export const AVTRANSPORT_SERVICE = 'urn:schemas-upnp-org:service:AVTransport:1';
export const RENDERING_CONTROL_SERVICE = 'urn:schemas-upnp-org:service:RenderingControl:1';

export const AVTRANSPORT_PATH = '/MediaRenderer/AVTransport/Control';
export const RENDERING_PATH = '/MediaRenderer/RenderingControl/Control';

/**
 * Build a SOAP envelope for a UPnP action.
 */
export function buildSoapEnvelope(
  serviceType: string,
  action: string,
  params: Record<string, string | number>
): string {
  const paramXml = Object.entries(params)
    .map(([k, v]) => `<${k}>${v}</${k}>`)
    .join('');

  return (
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" ' +
    's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
    '<s:Body>' +
    `<u:${action} xmlns:u="${serviceType}">` +
    paramXml +
    `</u:${action}>` +
    '</s:Body>' +
    '</s:Envelope>'
  );
}

/**
 * Send a SOAP command to a Sonos device.
 */
export async function sendSoapCommand(
  ip: string,
  port: number,
  path: string,
  serviceType: string,
  action: string,
  params: Record<string, string | number>
): Promise<string> {
  const url = `http://${ip}:${port}${path}`;
  const body = buildSoapEnvelope(serviceType, action, params);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset="utf-8"',
      SOAPAction: `"${serviceType}#${action}"`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`SOAP error ${response.status}: ${await response.text()}`);
  }

  return response.text();
}

// ─── AVTransport Commands ─────────────────────────────────────────────────────

export function buildSetAVTransportURI(streamUrl: string): string {
  return buildSoapEnvelope(AVTRANSPORT_SERVICE, 'SetAVTransportURI', {
    InstanceID: 0,
    CurrentURI: streamUrl,
    CurrentURIMetaData: '',
  });
}

export function buildPlay(): string {
  return buildSoapEnvelope(AVTRANSPORT_SERVICE, 'Play', {
    InstanceID: 0,
    Speed: 1,
  });
}

export function buildStop(): string {
  return buildSoapEnvelope(AVTRANSPORT_SERVICE, 'Stop', {
    InstanceID: 0,
  });
}

// ─── RenderingControl Commands ────────────────────────────────────────────────

export function buildSetVolume(volume: number): string {
  return buildSoapEnvelope(RENDERING_CONTROL_SERVICE, 'SetVolume', {
    InstanceID: 0,
    Channel: 'Master',
    DesiredVolume: Math.round(volume * 100),
  });
}

export function buildGetVolume(): string {
  return buildSoapEnvelope(RENDERING_CONTROL_SERVICE, 'GetVolume', {
    InstanceID: 0,
    Channel: 'Master',
  });
}
