
import { WorkerMailer } from 'worker-mailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailService {
  send(options: EmailOptions): Promise<void>;
}

export class ConsoleEmailService implements EmailService {
  async send(options: EmailOptions): Promise<void> {
    console.log('─── EMAIL SENT ────────────────────────────────');
    console.log(`TO:      ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`BODY:    ${options.text}`);
    console.log('───────────────────────────────────────────────');
  }
}

export class BrevoEmailService implements EmailService {
  constructor(private config: { user: string; pass: string }) {}

  async send(options: EmailOptions): Promise<void> {
    try {
      const mailer = await WorkerMailer.connect({
        host: 'smtp-relay.brevo.com',
        port: 587,
        authType: 'plain',
        credentials: {
          username: this.config.user,
          password: this.config.pass,
        },
      });

      await mailer.send({
        from: { name: 'Faculty Mentorship Portal', email: 'abhimamapapa29@gmail.com' },
        to: { email: options.to },
        subject: options.subject,
        html: options.html || options.text.replace(/\n/g, '<br/>'),
        text: options.text,
      });
    } catch (error: any) {
      console.error('SMTP Error:', error.message);
      throw error;
    }
  }
}
