import { Schema, model } from 'mongoose';

export interface ICounter {
  name: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

export const Counter = model<ICounter>('Counter', counterSchema);