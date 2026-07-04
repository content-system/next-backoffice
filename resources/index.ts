import { getLocale, usLocale } from "locale-service"
import { StringMap } from "onecore"
import { getRecordValue } from "web-one"
import { en as adminEN } from "./admin/en"
import { vi as adminVI } from "./admin/vi"
import { en as authenticationEN } from "./authentication/en"
import { vi as authenticationVI } from "./authentication/vi"
import { en as contentEN } from "./content/en"
import { vi as contentVI } from "./content/vi"
import { en as commonEN } from "./en"
import { vi as commonVI } from "./vi"

export const limits = [12, 24, 60, 100, 120, 180, 300, 600]
export const defaultLimit = 12
export const sort = "sort"
export const page = "page"
export const limit = "limit"

export const email = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$"

export class Gender {
  static Male = 'M';
  static Female = 'F';
}
export class Status {
  static Draft = 'D';
  static Submitted = 'S';
  static Rejected = 'R';
  static Approved = 'A';
  static Published = 'P';
  static Expired = 'E';
  static RequestToEdit = 'T';
  static Active = 'A';
  static Inactive = 'I';
  static Deativated = 'D';
  static Deleted = 'D';
}
export const statusNames: Map<string, string> = new Map([
  ["A", "Active"],
  ["I", "Inactive"],
])
export function getStatusName(status?: string, map?: StringMap): string | undefined {
  if (!status) {
    return ""
  }
  return statusNames.get(status)
}

export interface Resources {
  [key: string]: StringMap
}

const en: StringMap = {
  ...commonEN,
  ...authenticationEN,
  ...adminEN,
  ...contentEN
}
const vi: StringMap = {
  ...commonVI,
  ...authenticationVI,
  ...adminVI,
  ...contentVI
}

export const resources: Resources = {
  en: en,
  vi: vi,
}

export function getDateFormat(lang?: string, dateFormat?: string): string {
  if (dateFormat) {
    return dateFormat
  }
  if (!lang) {
    return usLocale.dateFormat
  }
  const locale = getLocale(lang) || usLocale
  return locale.dateFormat
}
export function getDefaultLang(): string {
  return "en"
}
export function isDefaultLang(lang?: string): boolean {
  return !lang || lang === "en"
}
export function getLangSearch(lang?: string): string {
  return !lang || lang === "en" ? "" : `?lang=${lang}`
}

export function getResource(lang?: string | null): StringMap {
  const l = lang ? lang : "en"
  const r = resources[l]
  return r ? r : resources["en"]
}

export function getLangByPath(path?: string | null): string {
  if (!path) {
    return "en"
  }
  return path === "/vi" || path.startsWith("/vi/") ? "vi" : "en"
}
export function getLang(record: Record<string, string | string[] | undefined>): string {
  const lang = getRecordValue(record.lang)
  return lang ? lang : "en"
}
