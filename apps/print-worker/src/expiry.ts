export function assertPrintWindow(expiresAt?: number, now = Date.now()) {
  if (expiresAt !== undefined && expiresAt <= now) {
    throw new Error("Receipt expired before printer delivery");
  }
}
