import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
  socket = null;

  connect() {
    this.socket = io(SOCKET_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Message events
  sendMessage(username, message) {
    if (this.socket) {
      this.socket.emit('sendMessage', { username, message });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  // Contact events
  onNewContact(callback) {
    if (this.socket) {
      this.socket.on('newContact', callback);
    }
  }

  // Remove listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();