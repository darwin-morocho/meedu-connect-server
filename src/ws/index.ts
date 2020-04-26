/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-console */
import { Server as IOServer, Socket } from 'socket.io';
import Rooms, { addConnection, removeConnection } from '../mongo/schemes/rooms';

const ws = (io: IOServer): void => {
  io.on('connection', (socket: Socket) => {
    // console.log('connected:', socket.id);

    const { username } = socket.handshake.query;
    // console.log('query', socket.handshake.query);

    io.to(socket.id).emit('connected', socket.id);

    socket.on('join-to', async (roomName: string) => {
      if (!socket.rooms[roomName]) {
        const userConnection = { socketId: socket.id, username };
        const room = await addConnection(roomName, userConnection);
        if (room) {
          socket.join(roomName);
          // if the user is not yet in the room
          const connectedUsers = room.connections;
          console.log('connectedUsers', connectedUsers);

          addConnection(roomName, userConnection);
          socket.handshake.query.room = roomName;
          socket.broadcast.to(roomName).emit('joined', userConnection); // notify to the others users
          io.to(socket.id).emit('joined-to', { roomName, connectedUsers }); // notify to the user

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
            socket.broadcast.to(roomName).emit('disconnected-user', socket.id);
          });
        } else {
          io.to(socket.id).emit('room-not-found', roomName);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('disconnected:', socket.id);
      const { room } = socket.handshake.query;
      if (room) {
        console.log('leave room:', room, socket.id);
        removeConnection(room, socket.id);
        io.to(room).emit('disconnected-user', socket.id);
      }
    });
  });
};

export default ws;
