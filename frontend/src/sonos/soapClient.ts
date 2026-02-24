/**
 * Minimal UPnP/SOAP client for Sonos control.
 * Builds and sends SOAP envelopes to Sonos AVTransport and RenderingControl services.
 */

export const AVTRANSPORT_SERVICE = 'urn:schemas-upnp-org:service:AVTransport:1';
export const RENDERING_CONTROL_SERVICE = 'urn:schemas-upnp-org:service:RenderingControl:1';

export const AVTRANSPORT_PATH = '/MediaRenderer/AVTransport/Control';
export const RENDERING_PATH = '/MediaRenderer/RenderingControl/Control';

/**
 * XML-escape a string for safe embedding in SOAP/XML payloads.
 * Required for CurrentURIMetaData which contains XML that must be escaped.
 */
export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build DIDL-Lite XML metadata for an MP3 radio stream.
 * This tells Sonos: "treat this URL as an internet radio / audio broadcast stream."
 * The <res protocolInfo="http-get:*:audio/mpeg:*"> element ensures Sonos
 * interprets the stream as MP3 (not HTML, not WAV).
 */
export function buildDIDLMetadata(title: string, streamUrl: string): string {
  // Inner XML is constructed, then this string is XML-escaped when embedded in SOAP
  return (
    '<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"' +
    ' xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    ' xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"' +
    ' xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/">' +
    '<item id="R:0/0/0" parentID="R:0/0" restricted="true">' +
    `<dc:title>${xmlEscape(title)}</dc:title>` +
    '<upnp:class>object.item.audioItem.audioBroadcast</upnp:class>' +
    `<res protocolInfo="http-get:*:audio/mpeg:*">${xmlEscape(streamUrl)}</res>` +
    '<desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">' +
    'SA_RINCON65031_' +
    '</desc>' +
    '</item>' +
    '</DIDL-Lite>'
  );
}

/**
 * Build a SOAP envelope for a UPnP action.
 * String values are XML-escaped to prevent breaking the envelope structure.
 */
export function buildSoapEnvelope(
  serviceType: string,
  action: string,
  params: Record<string, string | number>
): string {
  const paramXml = Object.entries(params)
    .map(([k, v]) => `<${k}>${typeof v === 'string' ? xmlEscape(v) : v}</${k}>`)
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

// ─── Convenience builders ─────────────────────────────────────────────────────

export function buildSetAVTransportURI(streamUrl: string, title = 'OrbCast'): string {
  return buildSoapEnvelope(AVTRANSPORT_SERVICE, 'SetAVTransportURI', {
    InstanceID: 0,
    CurrentURI: streamUrl,
    CurrentURIMetaData: buildDIDLMetadata(title, streamUrl),
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
