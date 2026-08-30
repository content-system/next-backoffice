import { getCurrentUser } from "@lib/account"
import { logger, toString } from "@lib/logger"
import { getResource } from "@resources"
import { getJobService, Job, jobModel } from "@service/job"
import { NextRequest, NextResponse } from "next/server"
import { validate } from "validation-core"
import { isSuccessful } from "web-one"
import { nanoid } from "nanoid"

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

if (!job.id) {
  job.id = nanoid(10)
}

  if (typeof (job as any).skills === "string") {
    job.skills = ((job as any).skills as string)
      .split(",")
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0)
  }

  const errors = validate(job, jobModel, resource)

 if (errors.length > 0) {
  console.log(errors)
  return NextResponse.json(errors, { status: 422 })
}

  const service = getJobService()

  try {
    const res = await service.create(job)

    const status = isSuccessful(res) ? 200 : 410

    return NextResponse.json(res, { status })
  } catch (err: any) {
  console.log(err)
  logger.error(err)

    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}