/**
 * Unit tests for Receiver Adapter interface compliance
 */
import { MockAdapter, ChromecastPlaceholder } from '../../receivers/MockAdapter';

describe('MockAdapter', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  it('starts disconnected', () => {
    expect(adapter.isConnected()).toBe(false);
    expect(adapter.getStatus()).toBe('idle');
  });

  it('has correct metadata', () => {
    expect(adapter.id).toBe('mock-receiver-1');
    expect(adapter.type).toBe('mock');
    expect(adapter.name).toBeDefined();
    expect(adapter.description).toBeDefined();
  });

  it('connects and sets status to connected', async () => {
    await adapter.connect('http://stream.test/stream');
    expect(adapter.isConnected()).toBe(true);
    expect(adapter.getStatus()).toBe('connected');
  });

  it('disconnects and resets state', async () => {
    await adapter.connect('http://stream.test/stream');
    await adapter.disconnect();
    expect(adapter.isConnected()).toBe(false);
    expect(adapter.getStatus()).toBe('idle');
  });

  it('sets volume within 0..1 range', async () => {
    await adapter.setVolume(0.8);
    const vol = await adapter.getVolume();
    expect(vol).toBe(0.8);
  });

  it('clamps volume below 0', async () => {
    await adapter.setVolume(-0.5);
    const vol = await adapter.getVolume();
    expect(vol).toBe(0);
  });

  it('clamps volume above 1', async () => {
    await adapter.setVolume(1.5);
    const vol = await adapter.getVolume();
    expect(vol).toBe(1);
  });
});

describe('ChromecastPlaceholder', () => {
  it('throws on connect', async () => {
    const adapter = new ChromecastPlaceholder();
    await expect(adapter.connect('http://stream.test/stream')).rejects.toThrow();
  });

  it('reports not connected', () => {
    const adapter = new ChromecastPlaceholder();
    expect(adapter.isConnected()).toBe(false);
  });
});
