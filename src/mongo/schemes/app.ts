import { Schema, Document, model } from 'mongoose';

export interface App extends Document {
  appName: string;
  apiKey: string;
  hosts: string[];
}

const schema = new Schema(
  {
    appName: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
    hosts: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Apps = model<App>('app', schema);
export default Apps;
