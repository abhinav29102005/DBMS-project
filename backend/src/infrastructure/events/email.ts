/**
 * UIMS Infrastructure — Email Service
 * 
 * Replaces Resend. Supports a "Zero Cost" approach by providing
 * a base interface that can be implemented by free-tier providers
 * (like Brevo, SendGrid, or just Console during development).
 */

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailService {
  send(options: EmailOptions): Promise<void>;
}

/**
 * Dev implementation: Just logs to console.
 * Truly free!
 */
export class ConsoleEmailService implements EmailService {
  async send(options: EmailOptions): Promise<void> {
    console.log('─── EMAIL SENT ────────────────────────────────');
    console.log(`TO:      ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`BODY:    ${options.text}`);
    console.log('───────────────────────────────────────────────');
  }
}

/**
 * Brevo implementation placeholder (Free: 300 emails/day)
 * Use this as a replacement for Resend.
 */
export class BrevoEmailService implements EmailService {
  constructor(private apiKey: string) {}

  async send(options: EmailOptions): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'UIMS System', email: 'no-reply@uims.edu' },
        to: [{ email: options.to }],
        subject: options.subject,
        textContent: options.text,
        htmlContent: options.html || options.text,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Brevo send failed: ${err}`);
    }
  }
}
