import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHash } from 'crypto'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there's no session and the user is trying to access a protected route
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a session and the user is on the auth page
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  // Check if the request is for the API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const apiKey = req.headers.get('x-api-key')

    // Skip API key check for API key management routes
    if (req.nextUrl.pathname.startsWith('/api/settings/api-keys')) {
      return res
    }

    // Require API key for all other API routes
    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: 'API key is required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      )
    }

    try {
      // Hash the provided API key
      const hashedKey = createHash('sha256').update(apiKey).digest('hex')

      // Check if the API key exists and is active
      const { data: apiKeyData, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key_hash', hashedKey)
        .eq('is_active', true)
        .single()

      if (error || !apiKeyData) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid API key' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        )
      }

      // Check if the API key has expired
      if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
        return new NextResponse(
          JSON.stringify({ error: 'API key has expired' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        )
      }

      // Update last used timestamp
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', apiKeyData.id)

      // Add API key data to request headers for use in API routes
      res.headers.set('x-api-key-id', apiKeyData.id)
      res.headers.set('x-api-key-permissions', apiKeyData.permissions.join(','))
    } catch (error) {
      console.error('Error validating API key:', error)
      return new NextResponse(
        JSON.stringify({ error: 'Error validating API key' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      )
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
} 