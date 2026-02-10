import { invokeLLM } from "../_core/llm";

// Email service using SendGrid (configured via env)
export async function sendEmail(to: string, subject: string, htmlContent: string) {
  try {
    // In production, this would use SendGrid API
    // For now, we'll use the built-in notification service
    const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/email/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html: htmlContent,
        from: 'notifications@farmkonnect.com',
      }),
    });

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`);
    }

    return { success: true, messageId: `email_${Date.now()}` };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: String(error) };
  }
}

// SMS service using Twilio (configured via env)
export async function sendSMS(phoneNumber: string, message: string) {
  try {
    // In production, this would use Twilio API
    const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
      }),
    });

    if (!response.ok) {
      throw new Error(`SMS send failed: ${response.statusText}`);
    }

    return { success: true, messageId: `sms_${Date.now()}` };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: String(error) };
  }
}

// Generate email template for booking confirmation
export function generateBookingConfirmationEmail(data: {
  farmerName: string;
  equipmentName: string;
  rentalDays: number;
  amount: number;
  pickupDate: string;
  returnDate: string;
  bookingId: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .details { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .button { background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed! ✓</h1>
          </div>
          <div class="content">
            <p>Hello ${data.farmerName},</p>
            <p>Your equipment rental booking has been confirmed. Here are the details:</p>
            
            <div class="details">
              <p><strong>Equipment:</strong> ${data.equipmentName}</p>
              <p><strong>Rental Period:</strong> ${data.rentalDays} days</p>
              <p><strong>Pickup Date:</strong> ${data.pickupDate}</p>
              <p><strong>Return Date:</strong> ${data.returnDate}</p>
              <p><strong>Total Amount:</strong> ₦${data.amount.toLocaleString()}</p>
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            </div>

            <p>Please ensure you pick up the equipment on the scheduled date. If you have any questions, please contact our support team.</p>
            
            <a href="https://farmkonnect.com/bookings/${data.bookingId}" class="button">View Booking Details</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 FarmKonnect. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Generate email template for payment received
export function generatePaymentReceivedEmail(data: {
  farmerName: string;
  amount: number;
  description: string;
  date: string;
  receiptId: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .details { background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Received! 💰</h1>
          </div>
          <div class="content">
            <p>Hello ${data.farmerName},</p>
            <p>We have received your payment. Thank you for your transaction!</p>
            
            <div class="details">
              <p><strong>Amount:</strong> ₦${data.amount.toLocaleString()}</p>
              <p><strong>Description:</strong> ${data.description}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Receipt ID:</strong> ${data.receiptId}</p>
            </div>

            <p>Your payment has been processed successfully. You can download your receipt from your account dashboard.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 FarmKonnect. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Generate email template for mentorship request
export function generateMentorshipRequestEmail(data: {
  mentorName: string;
  menteeeName: string;
  topic: string;
  requestId: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .details { background-color: #f5f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .button { background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Mentorship Request 👥</h1>
          </div>
          <div class="content">
            <p>Hello ${data.mentorName},</p>
            <p>${data.menteeeName} has requested mentorship from you!</p>
            
            <div class="details">
              <p><strong>Mentee:</strong> ${data.menteeeName}</p>
              <p><strong>Topic:</strong> ${data.topic}</p>
              <p><strong>Request ID:</strong> ${data.requestId}</p>
            </div>

            <p>Review the request and decide whether to accept or decline. You can set your own rates and availability.</p>
            
            <a href="https://farmkonnect.com/mentorship/requests/${data.requestId}" class="button">Review Request</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 FarmKonnect. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Send SMS notification for urgent events
export async function sendUrgentSMS(phoneNumber: string, eventType: string, data: any) {
  const messages: Record<string, string> = {
    booking_confirmed: `Your equipment rental for ${data.equipmentName} is confirmed. Pickup: ${data.pickupDate}. Booking ID: ${data.bookingId}`,
    payment_received: `Payment of ₦${data.amount.toLocaleString()} received. Receipt: ${data.receiptId}`,
    mentorship_request: `${data.mentorName} sent you a mentorship request. Reply to confirm.`,
    equipment_available: `${data.equipmentName} is now available for rental. Check it out!`,
    order_shipped: `Your order is on the way! Tracking: ${data.trackingNumber}`,
  };

  const message = messages[eventType] || 'You have a new notification from FarmKonnect';
  return sendSMS(phoneNumber, message);
}

// Batch send notifications
export async function batchSendNotifications(
  recipients: Array<{ email?: string; phone?: string; name: string }>,
  subject: string,
  htmlContent: string,
  smsMessage: string
) {
  const results = {
    emailSent: 0,
    smsSent: 0,
    failed: 0,
  };

  for (const recipient of recipients) {
    try {
      if (recipient.email) {
        await sendEmail(recipient.email, subject, htmlContent);
        results.emailSent++;
      }
      if (recipient.phone) {
        await sendSMS(recipient.phone, smsMessage);
        results.smsSent++;
      }
    } catch (error) {
      results.failed++;
      console.error(`Failed to send notification to ${recipient.name}:`, error);
    }
  }

  return results;
}

// Send notification via multiple channels
export async function sendMultiChannelNotification(
  recipient: { email?: string; phone?: string; name: string },
  channels: Array<'email' | 'sms' | 'push'>,
  data: {
    subject: string;
    htmlContent: string;
    smsMessage: string;
    pushTitle?: string;
    pushMessage?: string;
  }
) {
  const results: Record<string, boolean> = {};

  for (const channel of channels) {
    try {
      if (channel === 'email' && recipient.email) {
        await sendEmail(recipient.email, data.subject, data.htmlContent);
        results.email = true;
      } else if (channel === 'sms' && recipient.phone) {
        await sendSMS(recipient.phone, data.smsMessage);
        results.sms = true;
      } else if (channel === 'push') {
        // Push notifications handled by separate service
        results.push = true;
      }
    } catch (error) {
      console.error(`Failed to send ${channel} notification:`, error);
      results[channel] = false;
    }
  }

  return results;
}

// Scheduled notification sender (for digest emails, reminders, etc.)
export async function scheduleNotification(
  recipient: { email?: string; phone?: string },
  notificationType: 'daily_digest' | 'weekly_digest' | 'reminder' | 'alert',
  scheduledTime: Date,
  data: any
) {
  // In production, this would use a job queue like Bull or Agenda
  return {
    success: true,
    scheduledId: `scheduled_${Date.now()}`,
    scheduledTime,
    status: 'scheduled',
  };
}
