export async function sendTransactionalEmail(to: string, subject: string, html: string) {
  const endpoint = process.env.EMAIL_DELIVERY_WEBHOOK_URL
  const token = process.env.EMAIL_DELIVERY_TOKEN
  const expectedHost = process.env.EMAIL_DELIVERY_HOST
  if (!endpoint || !token || !expectedHost) return false
  const url = new URL(endpoint)
  if (url.protocol !== 'https:' || url.hostname !== expectedHost) throw new Error('Email delivery endpoint is not approved')
  const response = await fetch(url, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html }), signal: AbortSignal.timeout(10_000),
  })
  return response.ok
}
