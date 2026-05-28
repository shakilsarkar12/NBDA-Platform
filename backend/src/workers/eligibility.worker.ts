import cron from "node-cron";
import { autoResetEligibility } from "../services/user.service.js";

export function startEligibilityResetWorker(): void {
  cron.schedule("0 0 * * *", async () => {
    const startedAt = new Date();
    console.log(`[cron][eligibility] started at ${startedAt.toISOString()}`);

    try {
      const result = await autoResetEligibility(startedAt);
      console.log(
        `[cron][eligibility] done cutoff=${result.cutoff.toISOString()} matched=${result.matchedCount} modified=${result.modifiedCount}`
      );
    } catch (error) {
      console.error("[cron][eligibility] failed:", error);
    }
  });

  console.log("[cron][eligibility] scheduled daily at 00:00");
}

