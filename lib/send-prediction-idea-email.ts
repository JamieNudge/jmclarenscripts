import nodemailer from 'nodemailer';

export type PredictionIdeaEmailPayload = Record<string, unknown>;

function line(label: string, value: unknown): string {
  if (value == null) return '';
  const s = typeof value === 'string' ? value.trim() : String(value);
  if (!s) return '';
  return `${label}: ${s}\n`;
}

/** Plain-text body for owner inbox. */
export function formatPredictionIdeaEmailBody(payload: PredictionIdeaEmailPayload): string {
  const parts = [
    line('Name', payload.name),
    line('Email', payload.email),
    line('Idea', payload.ideaDescribe),
    line('Data relies on', payload.dataRelies),
    line('Expected output', payload.expectedOutput),
    line('Frequency', payload.frequency),
    line('Frequency (other)', payload.frequencyOther),
    line('Leagues / filters', payload.leaguesFilters),
    line('Has API', payload.hasApi),
    line('Duration', payload.duration),
    line('Hoping to learn', payload.hopingToLearn),
    line('Tested before', payload.testedBefore),
    line('Tested (detail)', payload.testedBeforeDescribe),
    line('Anything else', payload.anythingElse),
    line('User agent', payload.userAgent),
  ].filter(Boolean);
  return `New prediction idea submission\n\n${parts.join('\n')}`;
}

/**
 * Sends a notification email when Gmail SMTP env is set.
 * Does not throw; logs errors. Submission should still succeed if email fails.
 */
export async function sendPredictionIdeaNotifyEmail(payload: PredictionIdeaEmailPayload): Promise<void> {
  const user = process.env.GMAIL_SMTP_USER?.trim();
  const passRaw = process.env.GMAIL_SMTP_APP_PASSWORD;
  const pass = passRaw ? passRaw.replace(/\s+/g, '').trim() : '';
  const to = process.env.PREDICTION_IDEA_NOTIFY_EMAIL?.trim() || user;
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
    subject: `[Best Picks] Prediction idea — ${subjectName}`,
    text: formatPredictionIdeaEmailBody(payload),
  });
}
