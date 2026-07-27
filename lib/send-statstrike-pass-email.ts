import nodemailer from 'nodemailer';
import { passCreatePath, statStrikePublicOrigin } from '@/lib/statstrike/pass';

function smtpCreds(): { user: string; pass: string; from: string } | null {
  const user = process.env.GMAIL_SMTP_USER?.trim();
  const passRaw = process.env.GMAIL_SMTP_APP_PASSWORD;
  const pass = passRaw ? passRaw.replace(/\s+/g, '').trim() : '';
  if (!user || !pass) return null;
  return { user, pass, from: user };
}

async function sendMail(opts: { to: string; subject: string; text: string }): Promise<boolean> {
  const creds = smtpCreds();
  if (!creds) return false;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: creds.user, pass: creds.pass },
  });
  await transporter.sendMail({
    from: creds.from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
  });
  return true;
}

export async function sendStatStrikePassWelcomeEmail(input: {
  to: string;
  amountGbp: number;
  expiresAt: string;
  marketingConsent: boolean;
}): Promise<boolean> {
  const origin = statStrikePublicOrigin();
  const board = `${origin}/statstrike`;
  const support = `${origin}${passCreatePath()}`;
  const expiresLocal = new Date(input.expiresAt).toUTCString();

  const marketingLine = input.marketingConsent
    ? 'You’re also on the GoalLab / StatStrike updates list (you can unsubscribe anytime by emailing us).'
    : 'You did not opt in to marketing updates — this email is only about your pass.';

  const text = [
    'Thanks for supporting GoalLab.',
    '',
    `Your StatStrike 24-hour web pass (£${input.amountGbp}) is ready.`,
    `Access expires: ${expiresLocal}`,
    '',
    `Open the board: ${board}`,
    `If the board is still locked in this browser, open ${support}/success after checkout or contact support.`,
    '',
    'Included: full board + Your Picks / My Record on this device for 24 hours.',
    '',
    marketingLine,
    '',
    'Forecasts are informational, not gambling advice.',
    '— GoalLab',
  ].join('\n');

  return sendMail({
    to: input.to,
    subject: 'Your StatStrike 24h pass',
    text,
  });
}

export async function sendStatStrikePassSurveyEmail(input: {
  to: string;
  passId: string;
}): Promise<boolean> {
  const origin = statStrikePublicOrigin();
  const feedback = `${origin}/support/statstrike?survey=1&pass=${encodeURIComponent(input.passId)}`;

  const text = [
    'Your StatStrike 24-hour web pass has ended.',
    '',
    'If you have a minute, we’d love a short note on what worked and what didn’t:',
    feedback,
    '',
    'Or reply to this email — we read every message.',
    '',
    'Thanks for supporting GoalLab.',
    '— GoalLab',
  ].join('\n');

  return sendMail({
    to: input.to,
    subject: 'Quick StatStrike pass feedback?',
    text,
  });
}
