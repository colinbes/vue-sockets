import { io, Socket } from 'socket.io-client';

export class SocketService {
  private socket: Socket | null = null;
  private readonly url: string;

  constructor(url: string = 'ws://localhost:3000') {
    this.url = url;
  }

  connect(): Socket { //TODO not production suitable.
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket'],
        autoConnect: true
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (err) => {
        console.error(err);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket not connected. Call connect() first.');
    }
  }

  on<T = unknown>(event: string, callback: (data: T) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.error('Socket not connected. Call connect() first.');
    }
  }

  off<T = unknown>(event: string, callback?: (data: T) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Create a singleton instance
// const socketService = new SocketService();
// socketService.connect()

// export default socketService;
