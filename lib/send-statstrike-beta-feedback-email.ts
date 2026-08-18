import nodemailer from 'nodemailer';

export type StatstrikeBetaFeedbackEmailPayload = Record<string, unknown>;

const TOPIC_LABELS: Record<string, string> = {
  question: 'Question',
  feedback: 'Feedback',
  bug: 'Bug report',
};

function line(label: string, value: unknown): string {
  if (value == null) return '';
  const s = typeof value === 'string' ? value.trim() : String(value);
  if (!s) return '';
  return `${label}: ${s}\n`;
}

/** Plain-text body for owner inbox. */
export function formatStatstrikeBetaFeedbackEmailBody(payload: StatstrikeBetaFeedbackEmailPayload): string {
  const topicRaw = typeof payload.topic === 'string' ? payload.topic : '';
  const topicLabel = TOPIC_LABELS[topicRaw] ?? topicRaw;
  const parts = [
    line('Name', payload.name),
    line('Email', payload.email),
    line('Topic', topicLabel),
    line('Message', payload.message),
    line('User agent', payload.userAgent),
  ].filter(Boolean);
  return `New StatStrike Android feedback\n\n${parts.join('\n')}`;
}

/**
 * Sends a notification email when Gmail SMTP env is set.
 * Does not throw; logs errors. Submission should still succeed if email fails.
 */
export async function sendStatstrikeBetaFeedbackNotifyEmail(
  payload: StatstrikeBetaFeedbackEmailPayload,
): Promise<void> {
  const user = process.env.GMAIL_SMTP_USER?.trim();
  const passRaw = process.env.GMAIL_SMTP_APP_PASSWORD;
  const pass = passRaw ? passRaw.replace(/\s+/g, '').trim() : '';
  const to =
    process.env.STATSTRIKE_BETA_NOTIFY_EMAIL?.trim() ||
    process.env.PREDICTION_IDEA_NOTIFY_EMAIL?.trim() ||
    user;
  if (!user || !pass || !to) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const subjectName =
    typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : 'Someone';
  await transporter.sendMail({
    from: user,
    to,
    subject: `[Football Predictions] StatStrike Android — ${subjectName}`,
    text: formatStatstrikeBetaFeedbackEmailBody(payload),
  });
}
