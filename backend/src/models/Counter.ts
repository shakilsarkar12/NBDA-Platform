import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface CounterDocument extends Document {
  /** Counter key, e.g. `user:2026` */
  key: string;
  seq: number;
}

const counterSchema = new Schema<CounterDocument>(
  {
    key: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0, min: 0 },
  },
  { versionKey: false }
);

export const Counter: Model<CounterDocument> =
  mongoose.models.Counter ??
  mongoose.model<CounterDocument>("Counter", counterSchema);
