import { configureSync, getConsoleSink, getLogger } from "@logtape/logtape";
import { isDevelopment } from "../config";

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

const logtape = getLogger();

type LogEntry = {
  readonly [key: string]: unknown;
  readonly message: string;
};

export const Logger = {
  debug(entry: LogEntry) {
    logtape.debug(entry.message, entry);
  },

  error(entry: LogEntry) {
    logtape.error(entry.message, entry);
  },

  info(entry: LogEntry) {
    logtape.info(entry.message, entry);
  },

  warn(entry: LogEntry) {
    logtape.warn(entry.message, entry);
  },
};
