/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-console */
import { Server as IOServer, Socket } from 'socket.io';
import { addConnection, removeConnection } from '../mongo/schemes/rooms';

const ws = (io: IOServer): void => {
  io.on('connection', (socket: Socket) => {
    // console.log('connected:', socket.id);

    const { username } = socket.handshake.query;
    // console.log('query', socket.handshake.query);

    io.to(socket.id).emit('connected', socket.id);

    // a user is trying to join to one room
    socket.on('join-to', async (roomId: string) => {
      if (!socket.rooms[roomId]) {
        // if the user is not in the room
        const userConnection = { socketId: socket.id, username };
        const room = await addConnection(roomId, userConnection);
        if (room) {
          // if the room exits
          socket.join(roomId);
          socket.handshake.query.roomId = roomId;
          socket.broadcast.to(roomId).emit('joined', userConnection); // notify to the others users
          io.to(socket.id).emit('joined-to', room); // notify to the user
        } else {
          io.to(socket.id).emit('room-not-found', roomId);
        }
      }
    });

    // new ice canditate was recived
    socket.on('new-ice-candidate', (data: { socketId: string; candidate: any }) => {
      // send the ice cantidate to the user
      io.to(data.socketId).emit('ice-canditate', {
        socketId: socket.id,
        candidate: data.candidate,
      });
    });

    // new offer was recived
    socket.on('offer', (data: { socketId: string; offer: any }) => {
      // send the offer to the user
      io.to(data.socketId).emit('offer', {
        socketId: socket.id,
        offer: data.offer,
      });
    });

    // new answer was recived
    socket.on('answer', (data: { socketId: string; answer: any }) => {
      // send the answer to the user
      io.to(data.socketId).emit('answer', {
        socketId: socket.id,
        answer: data.answer,
      });
    });
    socket.on('leave', () => {
      const { roomId } = socket.handshake.query;
      if (roomId) {
        socket.leave(roomId);
        socket.handshake.query.roomId = null;
        removeConnection(roomId, socket.id);
        socket.broadcast.to(roomId).emit('disconnected-user', socket.id);
      }
    });

    socket.on('disconnect', () => {
      console.log('disconnected:', socket.id);
      const { roomId } = socket.handshake.query;
      if (roomId) {
        console.log('leave room:', roomId, socket.id);
        removeConnection(roomId, socket.id);
        io.to(roomId).emit('disconnected-user', socket.id);
      }
    });
  });
};

export default ws;
