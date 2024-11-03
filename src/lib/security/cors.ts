import { type NextRequest } from 'next/server'

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'https://admin.example.com',
  'https://api.example.com',
].filter(Boolean)

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'X-Client-Version',
]
const MAX_AGE = 86400 // 24 hours

export function corsMiddleware(req: NextRequest) {
  const origin = req.headers.get('origin')
  
  // Always allow requests from our own domain
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    return new Headers({
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
      'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
      'Access-Control-Max-Age': MAX_AGE.toString(),
      'Access-Control-Allow-Credentials': 'true',
      // Security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'",
    })
  }

  return null
}