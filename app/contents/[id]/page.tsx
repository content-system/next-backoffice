import { getCurrentUser } from "@lib/account"
import { redirect } from "next/navigation"

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const query = await searchParams
  const account = await getCurrentUser()
  const lang = typeof query.lang === "string" ? query.lang : account?.language || "en"
  redirect(`/contents/${encodeURIComponent(id)}/${encodeURIComponent(lang)}`)
}
