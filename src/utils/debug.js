/*
 * IMPORTS
 */
import debug from "debug";

/*
 * CONFIG
 */
const ENV = import.meta.env.MODE || "development";

/*
 * NAMESPACES
 */
const createLogger = (namespace) => {
  const logger = debug(`app:${namespace}`);

  return {
    info: (message, data = {}) => {
      if (ENV === "development") {
        logger(`INFO: ${message}`, data);
      }
    },
    warn: (message, data = {}) => {
      if (ENV === "development") {
        logger(`WARN: ${message}`, data);
      }
    },
    error: (message, error = null, data = {}) => {
      if (ENV === "development") {
        logger(`ERROR: ${message}`, {
          error: error?.message || error,
          ...data,
        });
      }
    },
    debug: (message, data = {}) => {
      if (ENV === "development") {
        logger(`DEBUG: ${message}`, data);
      }
    },
  };
};

/*
 * EXPORTS
 */
export const authLogger = createLogger("auth");
export const chatLogger = createLogger("chat");
export const apiLogger = createLogger("api");
export const uiLogger = createLogger("ui");
export const networkLogger = createLogger("network");
export const apolloLogger = createLogger("apollo");
