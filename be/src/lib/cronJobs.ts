import cron from "node-cron";
import { getAllUniqueCities, updateWeatherForCities } from "./weatherService";

// Initialize all cron jobs
export function initializeCronJobs(): void {
  // Run hourly weather update at the start of each hour (0 * * * *)
  cron.schedule("0 * * * *", async () => {
    console.log("[CRON] Starting hourly weather update...");
    try {
      const cities = await getAllUniqueCities();
      if (cities.length > 0) {
        await updateWeatherForCities(cities);
      } else {
        console.log("[CRON] No cities to update");
      }
    } catch (error) {
      console.error("[CRON] Error in hourly weather update:", error);
    }
  });

  console.log("[CRON] Weather update cron job initialized (runs hourly at start of hour)");
}
