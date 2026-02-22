/**
 * Unit tests for SSDP response parsing
 */
import { parseSsdpResponse } from '../../sonos/discovery';

describe('parseSsdpResponse', () => {
  it('returns null when no Location header', () => {
    const raw = 'HTTP/1.1 200 OK\r\nST: urn:schemas-upnp-org:device:ZonePlayer:1\r\n\r\n';
    expect(parseSsdpResponse(raw)).toBeNull();
  });

  it('parses a valid SSDP response with location', () => {
    const raw =
      'HTTP/1.1 200 OK\r\n' +
      'LOCATION: http://192.168.1.101:1400/xml/device_description.xml\r\n' +
      'ST: urn:schemas-upnp-org:device:ZonePlayer:1\r\n\r\n';
    const result = parseSsdpResponse(raw);
    expect(result).not.toBeNull();
    expect(result?.ip).toBe('192.168.1.101');
    expect(result?.port).toBe(1400);
    expect(result?.status).toBe('online');
  });

  it('uses default port 1400 when no port in URL', () => {
    const raw =
      'HTTP/1.1 200 OK\r\n' +
      'LOCATION: http://192.168.1.200/xml/device_description.xml\r\n\r\n';
    const result = parseSsdpResponse(raw);
    expect(result?.port).toBe(1400);
  });

  it('handles lowercase location header', () => {
    const raw =
      'HTTP/1.1 200 OK\r\n' +
      'location: http://10.0.0.5:1400/device.xml\r\n\r\n';
    const result = parseSsdpResponse(raw);
    expect(result?.ip).toBe('10.0.0.5');
  });

  it('returns null for malformed location URL', () => {
    const raw =
      'HTTP/1.1 200 OK\r\n' +
      'LOCATION: not-a-url\r\n\r\n';
    const result = parseSsdpResponse(raw);
    expect(result).toBeNull();
  });
});
