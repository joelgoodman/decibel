import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/security/encryption'

export async function POST(req: NextRequest) {
  try {
    const { step, data } = await req.json()

    // Encrypt sensitive data
    const encryptedData = await encryptSensitiveData(step, data)

    await prisma.settings.upsert({
      where: { key: `setup_${step}` },
      update: { value: encryptedData },
      create: {
        key: `setup_${step}`,
        value: encryptedData,
      },
    })

    return withApiHeaders(
      new Response(null, { status: 204 })
    )
  } catch (error) {
    return handleApiError(error)
  }
}

async function encryptSensitiveData(step: string, data: any) {
  switch (step) {
    case 'database':
      return {
        ...data,
        password: await encrypt(data.password),
      }
    case 'email':
      if (data.smtp) {
        return {
          ...data,
          smtp: {
            ...data.smtp,
            password: await encrypt(data.smtp.password),
          },
        }
      }
      if (data.sendgrid) {
        return {
          ...data,
          sendgrid: {
            apiKey: await encrypt(data.sendgrid.apiKey),
          },
        }
      }
      if (data.ses) {
        return {
          ...data,
          ses: {
            ...data.ses,
            secretAccessKey: await encrypt(data.ses.secretAccessKey),
          },
        }
      }
      return data
    default:
      return data
  }
}