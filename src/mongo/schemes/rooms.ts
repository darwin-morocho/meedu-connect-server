import { Schema, Document, model } from 'mongoose';

export interface Room extends Document {
  name: string;
}

const schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default model<Room>('room', schema);
