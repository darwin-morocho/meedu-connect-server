import { Schema, Document, model } from 'mongoose';

export interface UserConnection {
  socketId: string;
  username: string;
  createdAt?: string;
}
export interface Room extends Document {
  name: string;
  connections: UserConnection[];
}

// schema
const schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    connections: {
      type: [{ socketId: String, username: String, createdAt: Date.now() }],
      default: [],
    },
  },
  { timestamps: true }
);

// model
const Rooms = model<Room>('room', schema);

export const checkRoom = async (name: string): Promise<Room | null> => {
  try {
    const room = await Rooms.findOne({ name });
    return room;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const connections = new Map<string, UserConnection[]>();

/**
 * check if a room exist and return the room with the current connected users
 * @param roomName
 * @param userConnection
 */
export const addConnection = async (
  roomName: string,
  userConnection: UserConnection
): Promise<Room | null> => {
  const room = await checkRoom(roomName);
  if (!room) return room;
  const tmp = room.toJSON();
  room.connections.push(userConnection);
  await room.save();
  return tmp;
};

export const removeConnection = async (roomName: string, socketId: string): Promise<void> => {
  await Rooms.updateOne({ name: roomName }, { $pull: { connections: { socketId } } });
};

export default Rooms;
