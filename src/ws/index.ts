/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-console */
import { Server as IOServer, Socket } from 'socket.io';

interface UserConnection {
  socketId: string;
  username: string;
}

const connections = new Map<string, UserConnection[]>();

const addConnection = (roomName: string, userConnection: UserConnection): void => {
  if (!connections.has(roomName)) {
    connections.set(roomName, [userConnection]);
  } else {
    const tmp: UserConnection[] = connections.get(roomName)!;
    connections.set(roomName, tmp.concat([userConnection]));
  }
};

const removeConnection = (roomName: string, socketId: string): void => {
  if (connections.has(roomName)) {
    const tmp: UserConnection[] = connections.get(roomName)!;
    const index = tmp.findIndex((item) => item.socketId === socketId);
    if (index !== -1) {
      connections.set(roomName, tmp.splice(index, 1));
    }
  }
};

const ws = (io: IOServer): void => {
  io.on('connection', (socket: Socket) => {
    // console.log('connected:', socket.id);

    const { username } = socket.handshake.query;
    // console.log('query', socket.handshake.query);

    io.to(socket.id).emit('connected', socket.id);

    socket.on('join-to', async (roomName: string) => {
      if (!socket.rooms[roomName]) {
        // if the user is not yet in the room
        const connectedUsers = connections.get(roomName) || [];
        console.log('connectedUsers', connectedUsers);
        socket.join(roomName);
        const userConnection = { socketId: socket.id, username };
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
