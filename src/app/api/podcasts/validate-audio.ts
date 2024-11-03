import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { z } from 'zod'
import { getAudioMetadata } from '@/lib/audio/metadata'

const urlSchema = z.object({
  url: z.string().url(),
})

export async function POST(req: NextRequest) {
  try {
    const { url } = urlSchema.parse(await req.json())
    
    // Validate that the URL points to an audio file
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    
    if (!contentType?.startsWith('audio/')) {
      return new Response('Invalid audio file', { status: 400 })
    }

    // Get audio metadata
    const metadata = await getAudioMetadata(url)

    return withApiHeaders(
      Response.json({ metadata })
    )
  } catch (error) {
    return handleApiError(error)
  }
}