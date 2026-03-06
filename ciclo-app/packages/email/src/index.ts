// @ciclo/email - Email Transacional
// Story E4.1: Confirmação, Lembretes e Feedback

// Client
export { sendEmail } from './client'
export type { SendEmailParams, SendEmailResult } from './client'

// Service (high-level, loads data from DB + renders + sends)
export {
  sendConfirmationEmail,
  sendReminder7dEmail,
  sendReminder24hEmail,
  sendFeedbackEmail,
} from './service'
export type { SendEmailServiceResult } from './service'

// Templates (low-level, for custom rendering)
export { renderConfirmationEmail } from './templates/confirmation'
export type { ConfirmationEmailData, EmailRenderResult } from './templates/confirmation'

export { renderReminder7dEmail } from './templates/reminder-7d'
export type { Reminder7dEmailData } from './templates/reminder-7d'

export { renderReminder24hEmail } from './templates/reminder-24h'
export type { Reminder24hEmailData, ScheduleItem } from './templates/reminder-24h'

export { renderFeedbackEmail } from './templates/feedback'
export type { FeedbackEmailData } from './templates/feedback'
