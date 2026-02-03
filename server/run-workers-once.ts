import "dotenv/config";
import { executeAllWorkers } from "./workers/scheduler";

(async () => {
  console.log("[bootstrap] Running all workers once...");
  const result = await executeAllWorkers();
  console.log("[bootstrap] Finished:", result);
  process.exit(0);
})();
