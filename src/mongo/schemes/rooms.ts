import { Schema, Document, model, Types } from 'mongoose';

export interface UserConnection {
  socketId: string;
  username: string;
  createdAt?: Date;
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
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
    microphoneEnabled: { type: Boolean, default: true },
    cameraEnabled: { type: Boolean, default: true },
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
    if (room) {
      console.log(room.connections);
    }
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
  await Rooms.findOneAndUpdate(
    { _id: Types.ObjectId(roomId) },
    { $pull: { connections: { socketId } } }
  );
  // setTimeout(() => {
  //   checkRoom(roomId);
  // }, 2000);
};

export const updateMediaStatus = async (data: {
  roomId: string;
  socketId: string;
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
}): Promise<void> => {
  // console.log('removing connection', socketId);
  await Rooms.findOneAndUpdate(
    { _id: Types.ObjectId(data.roomId), 'connections.socketId': data.socketId },
    {
      $set: {
        'connections.microphoneEnabled': data.microphoneEnabled,
        'connections.cameraEnabled': data.cameraEnabled,
      },
    }
  );
  // setTimeout(() => {
  //   checkRoom(roomId);
  // }, 2000);
};

export default Rooms;
