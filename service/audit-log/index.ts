import { db } from "@lib/db"
import { SearchRepository } from "sql-core"
import { AuditLog, AuditLogFilter, auditLogModel, AuditLogService } from "./audit-log"
export * from "./audit-log"

export function getAuditLogService(): AuditLogService {
  return new SearchRepository<AuditLog, AuditLogFilter>(db, "audit_logs", auditLogModel)
}
