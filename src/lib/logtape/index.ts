import { configureSync, getConsoleSink, getLogger } from "@logtape/logtape";
import { isDevelopment } from "@/config/env";

configureSync({
  filters: {},
  loggers: [
    {
      category: ["logtape", "meta"],
      lowestLevel: "warning",
      sinks: ["console"],
    },
    {
      category: [],
      lowestLevel: isDevelopment ? "debug" : "info",
      sinks: ["console"],
    },
  ],
  reset: true,
  sinks: {
    console: getConsoleSink(),
  },
});

export const logger = getLogger();
