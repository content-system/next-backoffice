import { getCurrentUser } from "@lib/account"
import { logger } from "@lib/logger"
import { getResource } from "@resources"
import { getJobService, Job, jobModel } from "@service/job"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"
import { isSuccessful } from "web-one"

export async function POST(req: NextRequest) {
  const account = await getCurrentUser()

  if (!account) {
    return new NextResponse("Require authentication", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  const resource = getResource(account.language)

  const job: Job = await req.json()

  // Convert skills từ string -> string[]
  if (typeof (job as any).skills === "string") {
    job.skills = ((job as any).skills as string)
      .split(",")
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0)
  }

  const errors = validate(job, jobModel, resource)
  if (errors.length > 0) {
    return NextResponse.json(errors, { status: 422 })
  }

  const service = getJobService()

  try {
    const res = await service.update(job)
    const status = isSuccessful(res) ? 200 : 410
    return NextResponse.json(res, { status })
  } catch (err) {
    logger.error(`Error at POST /jobs: ${err}`)

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}
