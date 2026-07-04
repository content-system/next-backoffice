import { getLang, getResource } from "@resources"
import { getRecordValue } from "web-one"
import LoginForm from "./LoginForm"

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const lang = getLang(query)
  const redirect = getRecordValue(query.redirect)
  const resource = getResource(lang)
  return <LoginForm lang={lang} resource={resource} redirect={redirect} />
}
