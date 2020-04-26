import { Schema, Document, model } from 'mongoose';

export interface UserConnection {
  socketId: string;
  username: string;
  createdAt?: Date;
}
export interface Room extends Document {
  name: string;
  description: string;
  connections: UserConnection[];
}

// schema
const schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    connections: {
      type: [
        {
          socketId: { type: String, unique: true },
          username: String,
          createdAt: { type: Date, default: new Date() },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// model
const Rooms = model<Room>('room', schema);

export const checkRoom = async (roomId: string): Promise<Room | null> => {
  try {
    const room = await Rooms.findById(roomId);
    return room;
  } catch (e) {
    console.log(e);
    return null;
  }
};

/**
 * check if a room exist and return the room with the current connected users
 * @param roomName
 * @param userConnection
 */
export const addConnection = async (
  roomId: string,
  userConnection: UserConnection
): Promise<Room | null> => {
  const room = await checkRoom(roomId);
  if (!room) return room;
  const tmp = room.toJSON();
  room.connections.push(userConnection);
  await room.save();
  return tmp;
};

export const removeConnection = async (roomId: string, socketId: string): Promise<void> => {
  console.log('removing connection', socketId);
  await Rooms.findById(roomId, { $pull: { connections: { socketId } } });
};

export default Rooms;
