/**
 * Unit tests for SOAP envelope generation
 */
import {
  buildSoapEnvelope,
  buildSetAVTransportURI,
  buildPlay,
  buildStop,
  buildSetVolume,
  AVTRANSPORT_SERVICE,
  RENDERING_CONTROL_SERVICE,
} from '../sonos/soapClient';

describe('buildSoapEnvelope', () => {
  it('creates a valid SOAP envelope with correct namespace', () => {
    const xml = buildSoapEnvelope(AVTRANSPORT_SERVICE, 'Play', { InstanceID: 0, Speed: 1 });
    expect(xml).toContain('Envelope');
    expect(xml).toContain('Body');
    expect(xml).toContain('xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"');
    expect(xml).toContain('<u:Play');
    expect(xml).toContain('</u:Play>');
  });

  it('includes all params in the envelope', () => {
    const xml = buildSoapEnvelope(AVTRANSPORT_SERVICE, 'SetVolume', {
      InstanceID: 0,
      Channel: 'Master',
      DesiredVolume: 50,
    });
    expect(xml).toContain('<InstanceID>0</InstanceID>');
    expect(xml).toContain('<Channel>Master</Channel>');
    expect(xml).toContain('<DesiredVolume>50</DesiredVolume>');
  });
});

describe('buildSetAVTransportURI', () => {
  it('includes stream URL in the envelope', () => {
    const url = 'http://192.168.1.100:8080/stream';
    const xml = buildSetAVTransportURI(url);
    expect(xml).toContain('<CurrentURI>http://192.168.1.100:8080/stream</CurrentURI>');
    expect(xml).toContain('SetAVTransportURI');
  });
});

describe('buildPlay', () => {
  it('builds a valid Play command', () => {
    const xml = buildPlay();
    expect(xml).toContain('<u:Play');
    expect(xml).toContain('<Speed>1</Speed>');
  });
});

describe('buildStop', () => {
  it('builds a valid Stop command', () => {
    const xml = buildStop();
    expect(xml).toContain('<u:Stop');
    expect(xml).toContain('<InstanceID>0</InstanceID>');
  });
});

describe('buildSetVolume', () => {
  it('converts 0..1 to 0..100', () => {
    const xml = buildSetVolume(0.5);
    expect(xml).toContain('<DesiredVolume>50</DesiredVolume>');
  });

  it('clamps volume at 100 for value 1', () => {
    const xml = buildSetVolume(1);
    expect(xml).toContain('<DesiredVolume>100</DesiredVolume>');
  });

  it('sets volume to 0 for value 0', () => {
    const xml = buildSetVolume(0);
    expect(xml).toContain('<DesiredVolume>0</DesiredVolume>');
  });
});
