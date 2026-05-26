import { Counter } from "../models/Counter.js";

/**
 * Atomically increments and returns the next serial for user uniqueId generation.
 * Counter key format: `user:YYYY`
 */
export async function getNextUserSequence(year: number): Promise<number> {
  const counterId = `user:${year}`;

  const counter = await Counter.findOneAndUpdate(
    { key: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  if (!counter) {
    throw new Error("Failed to allocate user sequence");
  }

  return counter.seq;
}
