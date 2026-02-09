import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

/**
 * Appointment Reminder Service
 * Handles SMS and Email reminders for veterinary appointments
 */

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export interface AppointmentReminder {
  appointmentId: number;
  animalName: string;
  appointmentDate: Date;
  veterinarian: string;
  appointmentType: string;
  phoneNumber?: string;
  email?: string;
  farmerId: number;
}

export interface ReminderResult {
  success: boolean;
  smsId?: string;
  emailId?: string;
  error?: string;
}

/**
 * Send SMS reminder for appointment
 */
export async function sendSMSReminder(reminder: AppointmentReminder): Promise<ReminderResult> {
  try {
    if (!reminder.phoneNumber) {
      return { success: false, error: 'Phone number not provided' };
    }

    const appointmentTime = new Date(reminder.appointmentDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Reminder: Veterinary appointment for ${reminder.animalName} with ${reminder.veterinarian} on ${appointmentTime}. Type: ${reminder.appointmentType}. Reply CONFIRM to confirm or CANCEL to cancel.`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: reminder.phoneNumber,
    });

    return {
      success: true,
      smsId: result.sid,
    };
  } catch (error) {
    console.error('SMS reminder error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
}

/**
 * Send Email reminder for appointment
 */
export async function sendEmailReminder(reminder: AppointmentReminder, farmerEmail: string): Promise<ReminderResult> {
  try {
    if (!farmerEmail) {
      return { success: false, error: 'Email not provided' };
    }

    const appointmentTime = new Date(reminder.appointmentDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const emailContent = `
      <h2>Veterinary Appointment Reminder</h2>
      <p>Dear Farmer,</p>
      <p>This is a reminder about your upcoming veterinary appointment:</p>
      <ul>
        <li><strong>Animal:</strong> ${reminder.animalName}</li>
        <li><strong>Date & Time:</strong> ${appointmentTime}</li>
        <li><strong>Veterinarian:</strong> ${reminder.veterinarian}</li>
        <li><strong>Appointment Type:</strong> ${reminder.appointmentType}</li>
      </ul>
      <p>Please ensure you are available at the scheduled time. If you need to reschedule, please contact your veterinarian as soon as possible.</p>
      <p>Best regards,<br/>FarmKonnect Team</p>
    `;

    const msg = {
      to: farmerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@farmkonnect.com',
      subject: `Appointment Reminder: ${reminder.animalName} - ${appointmentTime}`,
      html: emailContent,
    };

    const result = await sgMail.send(msg);

    return {
      success: true,
      emailId: result[0].headers['x-message-id'],
    };
  } catch (error) {
    console.error('Email reminder error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send prescription expiry reminder
 */
export async function sendPrescriptionExpiryReminder(
  prescriptionId: number,
  animalName: string,
  expiryDate: Date,
  phoneNumber?: string,
  email?: string
): Promise<ReminderResult> {
  try {
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (phoneNumber) {
      const message = `Alert: Prescription for ${animalName} expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString()}). Please request a renewal from your veterinarian.`;

      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Prescription expiry reminder error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reminder',
    };
  }
}

/**
 * Send vaccination due reminder
 */
export async function sendVaccinationDueReminder(
  animalName: string,
  vaccinationType: string,
  dueDate: Date,
  phoneNumber?: string,
  email?: string
): Promise<ReminderResult> {
  try {
    const daysUntilDue = Math.floor((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (phoneNumber) {
      const message = `Reminder: ${vaccinationType} vaccination for ${animalName} is due in ${daysUntilDue} days (${dueDate.toLocaleDateString()}). Schedule an appointment with your veterinarian.`;

      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Vaccination reminder error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reminder',
    };
  }
}

/**
 * Send appointment confirmation request
 */
export async function sendAppointmentConfirmationRequest(
  reminder: AppointmentReminder,
  confirmationLink: string
): Promise<ReminderResult> {
  try {
    if (!reminder.phoneNumber) {
      return { success: false, error: 'Phone number not provided' };
    }

    const message = `Please confirm your appointment for ${reminder.animalName} with ${reminder.veterinarian}. Click here to confirm: ${confirmationLink}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: reminder.phoneNumber,
    });

    return {
      success: true,
      smsId: result.sid,
    };
  } catch (error) {
    console.error('Confirmation request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send confirmation request',
    };
  }
}

/**
 * Send bulk appointment reminders
 */
export async function sendBulkAppointmentReminders(
  reminders: AppointmentReminder[],
  farmerEmails: Map<number, string>
): Promise<{ successful: number; failed: number; errors: string[] }> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const reminder of reminders) {
    try {
      // Send SMS if phone number available
      if (reminder.phoneNumber) {
        const smsResult = await sendSMSReminder(reminder);
        if (smsResult.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`SMS failed for ${reminder.animalName}: ${smsResult.error}`);
        }
      }

      // Send Email if email available
      const farmerEmail = farmerEmails.get(reminder.farmerId);
      if (farmerEmail) {
        const emailResult = await sendEmailReminder(reminder, farmerEmail);
        if (emailResult.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`Email failed for ${reminder.animalName}: ${emailResult.error}`);
        }
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error processing reminder for ${reminder.animalName}`);
    }
  }

  return results;
}

/**
 * Schedule recurring appointment reminders
 * Sends reminders 24 hours and 1 hour before appointment
 */
export async function scheduleAppointmentReminders(
  reminder: AppointmentReminder,
  farmerEmail: string
): Promise<void> {
  const appointmentTime = new Date(reminder.appointmentDate).getTime();
  const now = new Date().getTime();

  // 24-hour reminder
  const remindIn24Hours = appointmentTime - 24 * 60 * 60 * 1000;
  if (remindIn24Hours > now) {
    setTimeout(() => {
      sendSMSReminder(reminder);
      sendEmailReminder(reminder, farmerEmail);
    }, remindIn24Hours - now);
  }

  // 1-hour reminder
  const remindIn1Hour = appointmentTime - 60 * 60 * 1000;
  if (remindIn1Hour > now) {
    setTimeout(() => {
      sendSMSReminder(reminder);
    }, remindIn1Hour - now);
  }
}
