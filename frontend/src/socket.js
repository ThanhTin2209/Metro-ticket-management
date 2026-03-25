import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      cb({ token: user.accessToken });
    } else {
      cb({ token: '' });
    }
  }
});
