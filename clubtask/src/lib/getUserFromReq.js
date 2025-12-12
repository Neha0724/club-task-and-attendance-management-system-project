import { verifyToken } from '@/lib/auth'

export function getUserFromReq(req) {
  const auth = req.headers.get('authorization') || ''
  if (!auth) return { error: 'No authorization header' }

  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return { error: 'Invalid authorization format' }

  const token = parts[1]
  if (!token) return { error: 'No token provided' }

  const payload = verifyToken(token)
  if (!payload) return { error: 'Invalid or expired token' }

  return { payload }
}
