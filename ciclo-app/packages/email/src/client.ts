/**
 * Resend Email Client (fetch-based, zero dependencies)
 * Story E4.1 — AC-1: Resend configurado com RESEND_API_KEY e EMAIL_FROM via ENV
 *
 * Uses native fetch() to call Resend REST API.
 * No npm dependency needed.
 */

const RESEND_API_URL = 'https://api.resend.com/emails'

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Sends an email via Resend REST API.
 * Requires RESEND_API_KEY and EMAIL_FROM environment variables.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const defaultFrom = process.env.EMAIL_FROM

  if (!apiKey) {
    console.error(JSON.stringify({
      event_type: 'email.send.error',
      error: 'RESEND_API_KEY environment variable not configured',
      timestamp: new Date().toISOString(),
    }))
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  if (!defaultFrom && !params.from) {
    console.error(JSON.stringify({
      event_type: 'email.send.error',
      error: 'EMAIL_FROM environment variable not configured',
      timestamp: new Date().toISOString(),
    }))
    return { success: false, error: 'EMAIL_FROM not configured' }
  }

  const body = {
    from: params.from ?? defaultFrom,
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    html: params.html,
    ...(params.text ? { text: params.text } : {}),
    ...(params.replyTo ? { reply_to: params.replyTo } : {}),
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      const errorMessage = (errorData as { message?: string }).message ?? `HTTP ${response.status}`

      console.error(JSON.stringify({
        event_type: 'email.send.error',
        to: body.to,
        subject: params.subject,
        status: response.status,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }))

      return { success: false, error: errorMessage }
    }

    const data = await response.json() as { id?: string }

    console.log(JSON.stringify({
      event_type: 'email.send.success',
      email_id: data.id,
      to: body.to,
      subject: params.subject,
      timestamp: new Date().toISOString(),
    }))

    return { success: true, id: data.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    console.error(JSON.stringify({
      event_type: 'email.send.error',
      to: body.to,
      subject: params.subject,
      error: message,
      timestamp: new Date().toISOString(),
    }))

    return { success: false, error: message }
  }
}
