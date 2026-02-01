// Simplified notification service - ready for Twilio/SendGrid integration
// Add your API keys to environment variables when ready to activate

export interface NotificationPayload {
  userId: number;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  channels?: ('email' | 'sms' | 'push')[];
}

export class NotificationService {
  async sendEmail(to: string, subject: string, html: string) {
    // TODO: Integrate SendGrid
    // Requires: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL in env
    console.log(`[Notification] Email to ${to}: ${subject}`);
    
    // Placeholder for SendGrid integration:
    // import sgMail from '@sendgrid/mail';
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    // await sgMail.send({ to, from: process.env.SENDGRID_FROM_EMAIL!, subject, html });
    
    return { success: true, provider: 'sendgrid_placeholder' };
  }

  async sendSMS(to: string, body: string) {
    // TODO: Integrate Twilio
    // Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in env
    console.log(`[Notification] SMS to ${to}: ${body}`);
    
    // Placeholder for Twilio integration:
    // import twilio from 'twilio';
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to });
    
    return { success: true, provider: 'twilio_placeholder' };
  }

  async sendNotification(payload: NotificationPayload, userPreferences: any) {
    const results: any = {};

    // Determine channels based on severity
    const channels = payload.channels || this.getDefaultChannels(payload.severity, userPreferences);

    for (const channel of channels) {
      switch (channel) {
        case 'email':
          if (userPreferences.email && userPreferences.emailEnabled) {
            results.email = await this.sendEmail(
              userPreferences.email,
              payload.title,
              this.formatEmailHTML(payload)
            );
          }
          break;

        case 'sms':
          if (userPreferences.phoneNumber && userPreferences.smsEnabled) {
            results.sms = await this.sendSMS(
              userPreferences.phoneNumber,
              `${payload.title}: ${payload.message}`
            );
          }
          break;

        case 'push':
          // WebSocket push notification
          results.push = { success: true, provider: 'websocket' };
          break;
      }
    }

    return results;
  }

  private getDefaultChannels(severity: string, preferences: any): ('email' | 'sms' | 'push')[] {
    // Critical alerts go to all enabled channels
    if (severity === 'critical') {
      const channels: ('email' | 'sms' | 'push')[] = ['push'];
      if (preferences.emailEnabled) channels.push('email');
      if (preferences.smsEnabled) channels.push('sms');
      return channels;
    }

    // Warning alerts go to push and email
    if (severity === 'warning') {
      const channels: ('email' | 'sms' | 'push')[] = ['push'];
      if (preferences.emailEnabled) channels.push('email');
      return channels;
    }

    // Info alerts only via push
    return ['push'];
  }

  private formatEmailHTML(payload: NotificationPayload): string {
    const severityColors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      critical: '#ef4444',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${severityColors[payload.severity]}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
            .footer { margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${payload.title}</h2>
            </div>
            <div class="content">
              <p>${payload.message}</p>
              <p><strong>Severity:</strong> ${payload.severity.toUpperCase()}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div class="footer">
              <p>FarmKonnect - Agricultural Management Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const notificationService = new NotificationService();
