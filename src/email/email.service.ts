import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('app.smtp.host'),
      port: this.configService.get<number>('app.smtp.port'),
      auth: {
        user: this.configService.get<string>('app.smtp.user'),
        pass: this.configService.get<string>('app.smtp.pass'),
      },
    });
  }

  async sendInviteEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3001';
    const inviteLink = `${frontendUrl}/accept-invite?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; background: #f7f9fb; margin: 0; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%); padding: 40px 32px 32px; text-align: center; }
          .header h1 { color: #ffffff; font-size: 22px; margin: 0 0 8px; font-weight: 700; }
          .header p { color: rgba(255,255,255,0.5); font-size: 14px; margin: 0; }
          .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16,185,129,0.15); color: #10B981; padding: 6px 14px; border-radius: 40px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          .body { padding: 32px; }
          .body p { color: #45464d; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
          .cta { display: block; background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 600; text-align: center; margin: 24px 0; }
          .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; }
          .info-box p { color: #166534; font-size: 13px; margin: 0; }
          .footer { padding: 24px 32px; border-top: 1px solid #f2f4f6; text-align: center; }
          .footer p { color: #76777d; font-size: 12px; margin: 0; }
          .link-fallback { color: #76777d; font-size: 12px; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">⚡ Trusted Invitation</div>
            <h1>You've Been Invited</h1>
            <p>Join the Jurist AI Decision Platform</p>
          </div>
          <div class="body">
            <p>Hello,</p>
            <p>A member of the <strong>Jurist AI</strong> platform has invited you to join as a <strong>Trusted User</strong> — with enhanced voting weight and access to high-stakes collaborative decision-making.</p>
            
            <a href="${inviteLink}" class="cta">Accept Invitation & Register</a>
            
            <div class="info-box">
              <p>✓ <strong>Trusted User</strong> status with +2 voting weight bonus<br>
              ✓ Immediate access to all decision rooms<br>
              ✓ This link expires in <strong>72 hours</strong></p>
            </div>
            
            <p class="link-fallback">If the button doesn't work, copy this link:<br>${inviteLink}</p>
          </div>
          <div class="footer">
            <p>Jurist AI · Collaborative Decision Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Jurist AI" <${this.configService.get<string>('app.smtp.user') || 'noreply@jurist.ai'}>`,
        to: email,
        subject: `🔒 You've Been Invited to Jurist AI`,
        html,
      });
      this.logger.log(`Invite email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send invite email to ${email}`, error.stack);
      // Don't throw — invite was already created, email failure shouldn't block
    }
  }
}
