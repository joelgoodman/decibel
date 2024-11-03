import { NextRequest } from 'next/server'
import mjml2html from 'mjml'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'

export async function POST(req: NextRequest) {
  try {
    const { mjml } = await req.json()

    const { html, errors } = mjml2html(mjml, {
      validationLevel: 'soft',
    })

    if (errors.length > 0) {
      return Response.json(
        { error: errors[0].message },
        { status: 400 }
      )
    }

    return withApiHeaders(
      Response.json({ html })
    )
  } catch (error) {
    return handleApiError(error)
  }
}