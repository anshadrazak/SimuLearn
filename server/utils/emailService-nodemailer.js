import nodemailer from 'nodemailer';

// For development - Use Ethereal Email (fake SMTP)
// For production - Use your actual email service
const isDevelopment = process.env.NODE_ENV === 'development';

let transporter;

if (isDevelopment) {
  // Create ethereal email account on the fly
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log('📧 Development mode: Using Ethereal Email for testing');
  console.log('📧 Test account:', testAccount.user);
} else {
  // Production: Use Mailjet SMTP
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailjet.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.MAILJET_API_KEY,
      pass: process.env.SMTP_PASS || process.env.MAILJET_SECRET_KEY,
    },
  });
}

const fromEmail = process.env.MAILJET_FROM_EMAIL || 'noreply@lms.com';
const fromName = process.env.MAILJET_FROM_NAME || 'SimuLearn';

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  console.log(`Verification email for ${email}: ${verifyUrl}`);

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Verify your email address',
      text: `Click the link to verify your email: ${verifyUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Verify Your Email</h2>
          <p>Click the button below to verify your email address:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Verify Email
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link: ${verifyUrl}
          </p>
        </div>
      `,
    });

    console.log(`✓ Verification email sent to ${email}`);
    if (isDevelopment) {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Failed to send verification email:', error.message);
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  console.log(`Password reset email for ${email}: ${resetUrl}`);

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Reset your password',
      text: `Click the link to reset your password: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Reset Your Password</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link: ${resetUrl}
          </p>
        </div>
      `,
    });

    console.log(`✓ Password reset email sent to ${email}`);
    if (isDevelopment) {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Failed to send password reset email:', error.message);
  }
};
