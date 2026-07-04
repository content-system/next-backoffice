import { merge } from "config-plus"
import { createLogger, Logger } from "logger-core"
import { headers } from "next/headers"
import { config, env } from "../config"
import { Account } from "./account"

export const globalForDB = globalThis as unknown as {
  logger?: Logger
}
export function getLogger(): Logger {
  const cfg = merge(config, process.env, env, process.env.NODE_ENV)
  return createLogger(cfg.log)
}
export const logger = globalForDB.logger ?? getLogger()

if (process.env.NODE_ENV !== "production") {
  globalForDB.logger = logger
}

export async function logForbidden(account?: Account | null) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-fullpath") as string
  logger.warn(`This is a forbidden access attempt at ${pathname} by username ${account?.username || "unknown"} with id ${account?.id || "unknown"}`)
}
export async function logError(err: any) {
  const headerList = await headers()
  const pathname = headerList.get("x-current-fullpath") as string
  logger.error(`Error at ${pathname}: ${toString(err)}`)
}
export function toString(v: any): string {
  if (typeof v === "string") {
    return v
  } else {
    return JSON.stringify(v)
  }
}
