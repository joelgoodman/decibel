import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { sendEmail, sendBulkEmail } from '@/lib/email/send'
import { z } from 'zod'

const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  content: z.string().min(1),
  templateId: z.string().optional(),
  variables: z.record(z.any()).optional(),
})

const sendBulkEmailSchema = z.object({
  emails: z.array(sendEmailSchema),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const isBulk = Array.isArray(body.emails)

    if (isBulk) {
      const { emails } = sendBulkEmailSchema.parse(body)
      await sendBulkEmail(emails)
    } else {
      const data = sendEmailSchema.parse(body)
      await sendEmail(data)
    }

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}