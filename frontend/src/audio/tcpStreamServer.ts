/**
 * TCP Stream Server — OrbCast
 *
 * Runs a minimal HTTP/1.1 server on the phone using react-native-tcp-socket.
 * Serves a continuous MP3 stream on GET /stream.mp3 so Sonos can connect
 * directly to the phone on the local network.
 *
 * Architecture:
 *   Phone (TCP server :9000) ←── Sonos (GET /stream.mp3)
 *   Phone (MediaProjection) ──▶ PCM frames ──▶ MP3 frames ──▶ TCP socket
 *
 * Requires a custom dev build / EAS build with:
 *   - react-native-tcp-socket
 *   - react-native-community/netinfo
 *   - A native MP3 encoder (e.g., react-native-lame or a JSI module)
 *
 * In Expo Go / managed workflow this module gracefully does nothing.
 */

export type StreamServerStatus = 'stopped' | 'starting' | 'running' | 'error';

export interface StreamServerState {
  status: StreamServerStatus;
  /** Full HTTP URL that Sonos should connect to, e.g. http://192.168.1.x:9000/stream.mp3 */
  streamUrl: string | null;
  localIp: string | null;
  port: number;
  error: string | null;
}

const HTTP_200_HEADERS =
  'HTTP/1.1 200 OK\r\n' +
  'Content-Type: audio/mpeg\r\n' +
  'Cache-Control: no-cache, no-store\r\n' +
  'Connection: keep-alive\r\n' +
  'Transfer-Encoding: chunked\r\n' +
  'icy-name: OrbCast\r\n' +
  'icy-br: 128\r\n' +
  'icy-metaint: 0\r\n' +
  '\r\n';

const DEFAULT_PORT = 9000;
const STREAM_PATH = '/stream.mp3';

class TcpStreamServer {
  private _server: any = null;
  private _sockets: Set<any> = new Set();
  private _status: StreamServerStatus = 'stopped';
  private _localIp: string | null = null;
  private _port = DEFAULT_PORT;
  private _pcmCallback: (() => Buffer) | null = null;

  get state(): StreamServerState {
    return {
      status: this._status,
      streamUrl: this._localIp ? `http://${this._localIp}:${this._port}${STREAM_PATH}` : null,
      localIp: this._localIp,
      port: this._port,
      error: null,
    };
  }

  /** Register a callback that returns the next PCM chunk (raw 16-bit stereo at 44100Hz). */
  setPcmSource(cb: (() => Buffer) | null) {
    this._pcmCallback = cb;
  }

  async start(): Promise<StreamServerState> {
    if (this._status === 'running') return this.state;
    this._status = 'starting';

    try {
      // Get local IP via @react-native-community/netinfo
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const NetInfo = require('@react-native-community/netinfo').default;
      const state = await NetInfo.fetch();
      this._localIp = (state?.details as any)?.ipAddress ?? null;

      if (!this._localIp) throw new Error('Could not determine local IP address');

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const TcpSocket = require('react-native-tcp-socket').default;

      this._server = TcpSocket.createServer((socket: any) => {
        this._sockets.add(socket);

        socket.on('data', (data: Buffer) => {
          const request = data.toString('utf8');
          // Respond only to GET requests for our stream path
          if (!request.startsWith('GET') || !request.includes(STREAM_PATH)) {
            socket.write(
              'HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n'
            );
            socket.destroy();
            return;
          }
          // Send headers and start streaming
          socket.write(HTTP_200_HEADERS);
          this._streamToSocket(socket);
        });

        socket.on('error', () => this._sockets.delete(socket));
        socket.on('close', () => this._sockets.delete(socket));
      });

      this._server.listen({ port: this._port, host: '0.0.0.0' }, () => {
        this._status = 'running';
        console.log(`[TcpStreamServer] Listening on ${this.state.streamUrl}`);
      });

      this._server.on('error', (err: any) => {
        console.warn('[TcpStreamServer] Server error:', err.message);
        this._status = 'error';
      });

      // Wait briefly for listen callback
      await new Promise((r) => setTimeout(r, 200));
    } catch (err: any) {
      console.warn('[TcpStreamServer] Failed to start:', err.message);
      this._status = 'error';
    }

    return this.state;
  }

  stop() {
    this._sockets.forEach((s) => { try { s.destroy(); } catch { /* */ } });
    this._sockets.clear();
    try { this._server?.close(); } catch { /* */ }
    this._server = null;
    this._status = 'stopped';
  }

  /** Push raw PCM data to all connected sockets (encoded as chunked MP3 in production). */
  pushAudio(pcm: Buffer) {
    if (this._sockets.size === 0) return;
    // In production: encode PCM → MP3 frames here before writing
    // For now: we write PCM directly (replace with lame/JSI encoder)
    const hex = pcm.length.toString(16);
    const chunk = Buffer.concat([
      Buffer.from(`${hex}\r\n`),
      pcm,
      Buffer.from('\r\n'),
    ]);
    this._sockets.forEach((s) => {
      try { s.write(chunk); } catch { this._sockets.delete(s); }
    });
  }

  private _streamToSocket(socket: any) {
    // This will be replaced by a real audio pipeline.
    // For now it sends silence chunks every 100ms to keep the connection alive.
    const silenceChunk = Buffer.alloc(4410 * 2 * 2); // 100ms 44100Hz stereo 16-bit
    const interval = setInterval(() => {
      if (!this._sockets.has(socket)) { clearInterval(interval); return; }
      const pcm = this._pcmCallback ? this._pcmCallback() : silenceChunk;
      this.pushAudio(pcm);
    }, 100);
  }
}

export const tcpStreamServer = new TcpStreamServer();
