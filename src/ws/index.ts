/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-console */
import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import {
  joinTo,
  manageIceCandidates,
  manageOffers,
  manageAnswers,
  onMediaDeviceChanged,
  onLeave,
  screenSharing,
  onMessages,
} from './meet-manager';
import AES from '../api/security/aes';
import { UserAuthData } from '../models';

const ws = (io: IOServer): void => {
  /** check the token to allow the connection */
  io.use((socket: Socket, next: Function) => {
    try {
      const token = socket.handshake.query.token as string;
      if (!token) {
        throw { code: 403, message: 'missing token' };
      }
      const { encrypted } = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const data = AES.decrypt(encrypted, true) as UserAuthData;
      socket.handshake.query.userData = data;
      next(); // allow connection
    } catch (e) {
      socket.error(e.message); // send the error message
      socket.disconnect(true); // access denied
    }
  });

  io.on('connection', (socket: Socket) => {
    // console.log('connected:', socket.id);
    // console.log('query', socket.handshake.query);

    console.log('connected', socket.id);
    io.to(socket.id).emit('connected', socket.id);

    // a user is trying to join to one room
    joinTo(io, socket);

    onMessages(io, socket);

    onMediaDeviceChanged(io, socket);

    manageIceCandidates(io, socket);

    manageOffers(io, socket);

    manageAnswers(io, socket);

    screenSharing(io, socket);

    onLeave(io, socket);
  });
};

export default ws;
