import nodemailer from "nodemailer";
// Email service uses process.env directly for SMTP configuration

/**
 * Email Service for FarmKonnect
 * 
 * Sends transactional emails using SMTP (Gmail, SendGrid, AWS SES, etc.)
 * 
 * Environment Variables Required:
 * - SMTP_HOST: SMTP server host (e.g., smtp.gmail.com)
 * - SMTP_PORT: SMTP server port (e.g., 587 for TLS, 465 for SSL)
 * - SMTP_USER: SMTP username/email
 * - SMTP_PASS: SMTP password or app password
 * - SMTP_FROM_NAME: Sender name (e.g., "FarmKonnect")
 * - SMTP_FROM_EMAIL: Sender email address
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Create SMTP transporter
 * Falls back to console logging if SMTP is not configured (development mode)
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("[Email] SMTP not configured. Emails will be logged to console only.");
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

/**
 * Send email via SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const transporter = createTransporter();
  const fromName = process.env.SMTP_FROM_NAME || "FarmKonnect";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "noreply@farmkonnect.com";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
  };

  // If SMTP not configured, log to console (development mode)
  if (!transporter) {
    console.log("[Email] Would send email:");
    console.log(`  To: ${mailOptions.to}`);
    console.log(`  Subject: ${mailOptions.subject}`);
    console.log(`  Body: ${mailOptions.text?.substring(0, 200)}...`);
    return { success: true, messageId: "dev-mode-no-smtp" };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent to ${options.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[Email] Failed to send to ${options.to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Base email template with FarmKonnect branding
 */
function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FarmKonnect</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #10b981;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
      margin-bottom: 10px;
    }
    .tagline {
      color: #666;
      font-size: 14px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #10b981;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #059669;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      color: #666;
      font-size: 12px;
    }
    .alert {
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .alert-success {
      background-color: #d1fae5;
      border-left: 4px solid #10b981;
    }
    .alert-warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
    }
    .alert-danger {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌾 FarmKonnect</div>
      <div class="tagline">Agricultural Management System</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 FarmKonnect. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Registration Approved Email
 */
export function registrationApprovedEmail(name: string, email: string, loginUrl: string): EmailOptions {
  const content = `
    <h2>Welcome to FarmKonnect! 🎉</h2>
    <div class="alert alert-success">
      <strong>Your registration has been approved!</strong>
    </div>
    <p>Hi ${name},</p>
    <p>Great news! Your FarmKonnect account has been approved by our admin team. You can now log in and start managing your agricultural operations.</p>
    <p><strong>Your Account Details:</strong></p>
    <ul>
      <li>Email: ${email}</li>
      <li>Status: Active</li>
    </ul>
    <p style="text-align: center;">
      <a href="${loginUrl}" class="button">Log In Now</a>
    </p>
    <p>Once logged in, you'll have access to:</p>
    <ul>
      <li>Farm Management</li>
      <li>Crop Tracking</li>
      <li>Livestock Management</li>
      <li>Weather Integration</li>
      <li>Marketplace</li>
      <li>Training Programs</li>
      <li>And much more!</li>
    </ul>
    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
    <p>Happy farming!</p>
    <p><strong>The FarmKonnect Team</strong></p>
  `;

  return {
    to: email,
    subject: "Welcome to FarmKonnect - Your Account is Approved!",
    html: baseTemplate(content),
  };
}

/**
 * Registration Rejected Email
 */
export function registrationRejectedEmail(name: string, email: string, reason: string): EmailOptions {
  const content = `
    <h2>Registration Update</h2>
    <div class="alert alert-danger">
      <strong>Your registration request was not approved</strong>
    </div>
    <p>Hi ${name},</p>
    <p>Thank you for your interest in FarmKonnect. After reviewing your registration request, we're unable to approve your account at this time.</p>
    <p><strong>Reason:</strong></p>
    <p style="padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #ef4444;">
      ${reason}
    </p>
    <p>If you believe this decision was made in error or if you have additional information to provide, please contact our support team at support@farmkonnect.com.</p>
    <p>We appreciate your understanding.</p>
    <p><strong>The FarmKonnect Team</strong></p>
  `;

  return {
    to: email,
    subject: "FarmKonnect Registration Update",
    html: baseTemplate(content),
  };
}

/**
 * MFA Enabled Email
 */
export function mfaEnabledEmail(name: string, email: string): EmailOptions {
  const content = `
    <h2>Two-Factor Authentication Enabled</h2>
    <div class="alert alert-success">
      <strong>Your account security has been enhanced!</strong>
    </div>
    <p>Hi ${name},</p>
    <p>Two-factor authentication (2FA) has been successfully enabled on your FarmKonnect account.</p>
    <p>From now on, you'll need to enter a 6-digit code from your authenticator app whenever you log in.</p>
    <p><strong>Important Security Tips:</strong></p>
    <ul>
      <li>Keep your backup codes in a safe place</li>
      <li>Don't share your authenticator app with anyone</li>
      <li>If you lose your device, use a backup code to log in</li>
      <li>Contact support if you've used all backup codes</li>
    </ul>
    <div class="alert alert-warning">
      <strong>Didn't enable 2FA?</strong><br>
      If you didn't make this change, please contact our support team immediately at security@farmkonnect.com.
    </div>
    <p><strong>The FarmKonnect Team</strong></p>
  `;

  return {
    to: email,
    subject: "Two-Factor Authentication Enabled - FarmKonnect",
    html: baseTemplate(content),
  };
}

/**
 * Password Reset Request Email
 */
export function passwordResetEmail(name: string, email: string, resetToken: string, resetUrl: string): EmailOptions {
  const fullResetUrl = `${resetUrl}?token=${resetToken}`;
  
  const content = `
    <h2>Password Reset Request</h2>
    <div class="alert alert-warning">
      <strong>A password reset was requested for your account</strong>
    </div>
    <p>Hi ${name},</p>
    <p>We received a request to reset the password for your FarmKonnect account (${email}).</p>
    <p>Click the button below to reset your password:</p>
    <p style="text-align: center;">
      <a href="${fullResetUrl}" class="button">Reset Password</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="padding: 15px; background-color: #f9fafb; border-radius: 6px; word-break: break-all; font-size: 12px;">
      ${fullResetUrl}
    </p>
    <p><strong>This link will expire in 1 hour.</strong></p>
    <div class="alert alert-danger">
      <strong>Didn't request a password reset?</strong><br>
      If you didn't make this request, you can safely ignore this email. Your password will remain unchanged.
    </div>
    <p><strong>The FarmKonnect Team</strong></p>
  `;

  return {
    to: email,
    subject: "Reset Your FarmKonnect Password",
    html: baseTemplate(content),
  };
}

/**
 * Password Reset Success Email
 */
export function passwordResetSuccessEmail(name: string, email: string): EmailOptions {
  const content = `
    <h2>Password Changed Successfully</h2>
    <div class="alert alert-success">
      <strong>Your password has been updated!</strong>
    </div>
    <p>Hi ${name},</p>
    <p>This is a confirmation that the password for your FarmKonnect account (${email}) has been successfully changed.</p>
    <p>You can now log in with your new password.</p>
    <div class="alert alert-danger">
      <strong>Didn't change your password?</strong><br>
      If you didn't make this change, please contact our security team immediately at security@farmkonnect.com. Your account may have been compromised.
    </div>
    <p><strong>The FarmKonnect Team</strong></p>
  `;

  return {
    to: email,
    subject: "Password Changed - FarmKonnect",
    html: baseTemplate(content),
  };
}

/**
 * Account Disabled Email
 */
export function accountDisabledEmail(name: string, email: string, reason: string): EmailOptions {
  const content = `
    <h2>Account Status Update</h2>
    <div class="alert alert-danger">
      <strong>Your account has been disabled</strong>
    </div>
    <p>Hi ${name},</p>
    <p>Your FarmKonnect account (${email}) has been disabled by an administrator.</p>
    <p><strong>Reason:</strong></p>
    <p style="padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #ef4444;">
      ${reason}
    </p>
    <p>If you have questions about this action or would like to appeal, please contact our support team at support@farmkonnect.com.</p>
    <p><strong>The FarmKonnect Team</strong></p>
  `;

  return {
    to: email,
    subject: "Account Disabled - FarmKonnect",
    html: baseTemplate(content),
  };
}

/**
 * Account Enabled Email
 */
export function accountEnabledEmail(name: string, email: string, loginUrl: string): EmailOptions {
  const content = `
    <h2>Account Reactivated</h2>
    <div class="alert alert-success">
      <strong>Your account has been enabled!</strong>
    </div>
    <p>Hi ${name},</p>
    <p>Good news! Your FarmKonnect account (${email}) has been reactivated by an administrator.</p>
    <p>You can now log in and access all features.</p>
    <p style="text-align: center;">
      <a href="${loginUrl}" class="button">Log In Now</a>
    </p>
    <p><strong>The FarmKonnect Team</strong></p>
  `;

  return {
    to: email,
    subject: "Account Reactivated - FarmKonnect",
    html: baseTemplate(content),
  };
}
