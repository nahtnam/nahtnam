import { configureSync, getConsoleSink, getLogger } from "@logtape/logtape";
import { Define } from "within-ts";
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

export class Logger extends Define.Logger({
  debug(entry) {
    logtape.debug(entry.message, entry);
  },
  error(entry) {
    logtape.error(entry.message, entry);
  },
  info(entry) {
    logtape.info(entry.message, entry);
  },
  warn(entry) {
    logtape.warn(entry.message, entry);
  },
}) {}
