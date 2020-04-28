/* eslint-disable no-param-reassign */
import { Server as IOServer, Socket } from 'socket.io';
import Rooms, {
  addConnection,
  updateMediaStatus,
  removeConnection,
  checkRoom,
} from '../mongo/schemes/rooms';

// eslint-disable-next-line arrow-body-style
const getSocketsInRoom = (io: IOServer, roomId: string): Promise<string[]> => {
  return new Promise<string[]>((resolve, reject) => {
    io.sockets.in(roomId).clients((error: any, clients: any) => {
      if (error) resolve([]);
      // console.log(clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
      resolve(clients);
    });
  });
};

/**
 * manage when a user wants to connecto some room
 * @param io
 * @param socket
 */
export const joinTo = (io: IOServer, socket: Socket): void => {
  const { username } = socket.handshake.query;
  socket.on(
    'join-to',
    async (data: { roomId: string; microphoneEnabled: boolean; cameraEnabled: boolean }) => {
      const clients = await getSocketsInRoom(io, data.roomId);
      if (clients.length === 0) {
        // if there is no body in the roomId
        const room = await checkRoom(data.roomId);
        if (room && room.connections.length > 0) {
          // if we have data of a prevoius session
          room.connections = [];
          await room.save();
          console.log('deleting residual connections', data.roomId);
        }
      }

      if (!socket.rooms[data.roomId]) {
        // if the user is not in the room
        const userConnection = {
          socketId: socket.id,
          username,
          cameraEnabled: data.cameraEnabled,
          microphoneEnabled: data.microphoneEnabled,
        };
        const room = await addConnection(data.roomId, userConnection);
        if (room) {
          // if the room exits
          socket.join(data.roomId);
          socket.handshake.query.roomId = data.roomId;
          socket.broadcast.to(data.roomId).emit('joined', userConnection); // notify to the others users
          io.to(socket.id).emit('joined-to', room); // notify to the user
        } else {
          io.to(socket.id).emit('room-not-found', data.roomId);
        }
      }
    }
  );
};

/**
 *
 * @param io send the ice candidates
 * @param socket
 */
export const manageIceCandidates = (io: IOServer, socket: Socket): void => {
  // new ice canditate was recived
  socket.on('new-ice-candidate', (data: { socketId: string; candidate: any }) => {
    // send the ice cantidate to the user
    io.to(data.socketId).emit('ice-canditate', {
      socketId: socket.id,
      candidate: data.candidate,
    });
  });
};

/**
 * one user send offers to match a new meet
 * @param io
 * @param socket
 */
export const manageOffers = (io: IOServer, socket: Socket): void => {
  // new offer was recived
  socket.on('offer', (data: { socketId: string; offer: any }) => {
    // send the offer to the user
    io.to(data.socketId).emit('offer', {
      socketId: socket.id,
      offer: data.offer,
    });
  });
};

/**
 * notify to one user about the answers recived to previous offer sent
 * @param io
 * @param socket
 */
export const manageAnswers = (io: IOServer, socket: Socket): void => {
  // new answer was recived
  socket.on('answer', (data: { socketId: string; answer: any }) => {
    // send the answer to the user
    io.to(data.socketId).emit('answer', {
      socketId: socket.id,
      answer: data.answer,
    });
  });
};

export const screenSharing = (io: IOServer, socket: Socket): void => {
  socket.on('screen-sharing-offer', (data: { socketId: string; peerData: any }) => {
    io.to(data.socketId).emit('remote-screen-offer', {
      socketId: socket.id, // the current socket id
      peerData: data.peerData,
    });
  });

  socket.on('screen-sharing-answer', (data: { socketId: string; peerData: any }) => {
    io.to(data.socketId).emit('remote-screen-answer', {
      socketId: socket.id, // the current socket id
      peerData: data.peerData,
    });
  });

  socket.on('screen-sharing-stopped', () => {
    const { roomId } = socket.handshake.query;
    if (roomId) {
      socket.broadcast.to(roomId).emit('screen-sharing-stopped');
    }
  });
};

/**
 * catch when a user changes their media devices and notify to the others users
 * @param io
 * @param socket
 */
export const onMediaDeviceChanged = (io: IOServer, socket: Socket): void => {
  // notify to the other user that the camera or micro changes
  socket.on(
    'camera-or-microphone-changed',
    (data: { microphoneEnabled: boolean; cameraEnabled: boolean }) => {
      const { roomId } = socket.handshake.query;
      if (roomId) {
        const dataToSend = { socketId: socket.id, ...data };
        socket.broadcast.to(roomId).emit('camera-or-microphone-changed', dataToSend);
        updateMediaStatus({ roomId, ...dataToSend }); // updates into db
      }
    }
  );
};

/**
 * manage when a user leaves a meet
 * @param io
 * @param socket
 */
export const onLeave = (io: IOServer, socket: Socket): void => {
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
      io.to(roomId).emit('screen-sharing-stopped');
    }
  });
};
