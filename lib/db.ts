import { DB } from "onecore"
import { Pool } from "pg"
import { PoolManager } from "pg-extension"
import { config } from "../config"

export const globalForDB = globalThis as unknown as {
  pgPool?: Pool
  db?: DB
}
export function createPool(): Pool {
  console.log("enter create Pool")
  const dbURL = process.env.DB_URL || config.db.url
  return new Pool({ connectionString: dbURL, max: config.db.max })
}
export function createDB(): DB {
  console.log("enter create DB")
  const dbURL = process.env.DB_URL || config.db.url
  return new PoolManager(new Pool({ connectionString: dbURL, max: config.db.max }))
}
export const pool = globalForDB.pgPool ?? createPool()
export const db = globalForDB.db ?? createDB()

if (process.env.NODE_ENV !== "production") {
  globalForDB.pgPool = pool
  globalForDB.db = db
}
