import { z } from "zod";

/**
 * Notification Service for SMS and Email integration
 * Integrates with Twilio (SMS) and SendGrid (Email)
 */

export interface NotificationPayload {
  userId: number;
  farmId: number;
  title: string;
  message: string;
  type: 'breeding' | 'vaccination' | 'financial' | 'weather' | 'system';
  priority: 'low' | 'medium' | 'high';
  channel: 'sms' | 'email' | 'both';
  phoneNumber?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Send SMS notification via Twilio
   */
  static async sendSMS(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Mock SMS sending - in production, use Twilio SDK
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
      const recipientPhone = payload.phoneNumber || '+233XXXXXXXXX';
      
      console.log(`[SMS] Sending to ${recipientPhone}: ${payload.message}`);
      
      // In production:
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // const message = await client.messages.create({
      //   body: payload.message,
      //   from: twilioPhoneNumber,
      //   to: recipientPhone
      // });
      // return { success: true, messageId: message.sid };
      
      return {
        success: true,
        messageId: `SMS-${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send Email notification via SendGrid
   */
  static async sendEmail(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Mock email sending - in production, use SendGrid SDK
      const senderEmail = 'noreply@farmkonnect.com';
      const recipientEmail = payload.email || 'farmer@example.com';
      
      console.log(`[EMAIL] Sending to ${recipientEmail}: ${payload.title}`);
      
      // In production:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // const msg = {
      //   to: recipientEmail,
      //   from: senderEmail,
      //   subject: payload.title,
      //   html: `<h2>${payload.title}</h2><p>${payload.message}</p>`,
      // };
      // const response = await sgMail.send(msg);
      // return { success: true, messageId: response[0].headers['x-message-id'] };
      
      return {
        success: true,
        messageId: `EMAIL-${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send notification via selected channel(s)
   */
  static async sendNotification(payload: NotificationPayload): Promise<{ success: boolean; results: any }> {
    const results: any = {};

    if (payload.channel === 'sms' || payload.channel === 'both') {
      results.sms = await this.sendSMS(payload);
    }

    if (payload.channel === 'email' || payload.channel === 'both') {
      results.email = await this.sendEmail(payload);
    }

    return {
      success: Object.values(results).every((r: any) => r.success),
      results
    };
  }

  /**
   * Generate breeding reminder notification
   */
  static generateBreedingReminder(farmId: number, animalName: string, dueDate: string): NotificationPayload {
    return {
      userId: 0, // Will be set by caller
      farmId,
      title: 'Breeding Reminder',
      message: `${animalName} is ready for breeding. Recommended breeding date: ${dueDate}`,
      type: 'breeding',
      priority: 'high',
      channel: 'both'
    };
  }

  /**
   * Generate vaccination reminder notification
   */
  static generateVaccinationReminder(farmId: number, animalName: string, vaccineType: string): NotificationPayload {
    return {
      userId: 0,
      farmId,
      title: 'Vaccination Due',
      message: `${animalName} is due for ${vaccineType} vaccination. Please schedule the appointment.`,
      type: 'vaccination',
      priority: 'high',
      channel: 'both'
    };
  }

  /**
   * Generate financial threshold alert
   */
  static generateFinancialAlert(farmId: number, alertType: string, amount: number): NotificationPayload {
    return {
      userId: 0,
      farmId,
      title: 'Financial Alert',
      message: `${alertType}: GHS ${amount.toFixed(2)}. Review your farm finances.`,
      type: 'financial',
      priority: 'medium',
      channel: 'email'
    };
  }

  /**
   * Generate weather alert notification
   */
  static generateWeatherAlert(farmId: number, condition: string, recommendation: string): NotificationPayload {
    return {
      userId: 0,
      farmId,
      title: 'Weather Alert',
      message: `${condition}. Recommendation: ${recommendation}`,
      type: 'weather',
      priority: 'medium',
      channel: 'both'
    };
  }

  /**
   * Generate system notification
   */
  static generateSystemNotification(farmId: number, title: string, message: string): NotificationPayload {
    return {
      userId: 0,
      farmId,
      title,
      message,
      type: 'system',
      priority: 'low',
      channel: 'email'
    };
  }
}

/**
 * Notification preferences schema
 */
export const NotificationPreferencesSchema = z.object({
  userId: z.number(),
  farmId: z.number(),
  breedingReminders: z.boolean().default(true),
  breedingChannel: z.enum(['sms', 'email', 'both']).default('both'),
  vaccinationReminders: z.boolean().default(true),
  vaccinationChannel: z.enum(['sms', 'email', 'both']).default('both'),
  financialAlerts: z.boolean().default(true),
  financialThreshold: z.number().default(1000),
  weatherAlerts: z.boolean().default(true),
  weatherChannel: z.enum(['sms', 'email', 'both']).default('email'),
  systemNotifications: z.boolean().default(true),
  quietHoursStart: z.string().default('22:00'),
  quietHoursEnd: z.string().default('06:00'),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional()
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

/**
 * Notification scheduler for recurring alerts
 */
export class NotificationScheduler {
  private static schedules: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Schedule daily breeding reminders
   */
  static scheduleBreedingReminders(farmId: number, callback: () => Promise<void>) {
    const key = `breeding-${farmId}`;
    
    // Clear existing schedule if any
    if (this.schedules.has(key)) {
      clearInterval(this.schedules.get(key));
    }

    // Schedule for 8:00 AM daily
    const schedule = setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 8 && now.getMinutes() === 0) {
        await callback();
      }
    }, 60000); // Check every minute

    this.schedules.set(key, schedule);
  }

  /**
   * Schedule weekly vaccination reminders
   */
  static scheduleVaccinationReminders(farmId: number, callback: () => Promise<void>) {
    const key = `vaccination-${farmId}`;
    
    if (this.schedules.has(key)) {
      clearInterval(this.schedules.get(key));
    }

    // Schedule for Monday 10:00 AM
    const schedule = setInterval(async () => {
      const now = new Date();
      if (now.getDay() === 1 && now.getHours() === 10 && now.getMinutes() === 0) {
        await callback();
      }
    }, 60000);

    this.schedules.set(key, schedule);
  }

  /**
   * Schedule monthly financial reports
   */
  static scheduleFinancialReports(farmId: number, callback: () => Promise<void>) {
    const key = `financial-${farmId}`;
    
    if (this.schedules.has(key)) {
      clearInterval(this.schedules.get(key));
    }

    // Schedule for 1st of month at 9:00 AM
    const schedule = setInterval(async () => {
      const now = new Date();
      if (now.getDate() === 1 && now.getHours() === 9 && now.getMinutes() === 0) {
        await callback();
      }
    }, 60000);

    this.schedules.set(key, schedule);
  }

  /**
   * Cancel scheduled notifications
   */
  static cancelSchedule(key: string) {
    if (this.schedules.has(key)) {
      clearInterval(this.schedules.get(key));
      this.schedules.delete(key);
    }
  }

  /**
   * Cancel all schedules for a farm
   */
  static cancelAllSchedules(farmId: number) {
    const keys = Array.from(this.schedules.keys()).filter(k => k.includes(`-${farmId}`));
    keys.forEach(key => this.cancelSchedule(key));
  }
}
