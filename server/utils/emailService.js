import Mailjet from 'node-mailjet';

const apiKey = process.env.MAILJET_API_KEY || '';
const secretKey = process.env.MAILJET_SECRET_KEY || '';
const fromEmail = process.env.MAILJET_FROM_EMAIL || 'noreply@lms.com';
const fromName = process.env.MAILJET_FROM_NAME || 'SimuLearn';

let client = null;
if (apiKey && secretKey) {
  client = Mailjet.apiConnect(apiKey, secretKey);
}

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  console.log(`Verification email for ${email}: ${verifyUrl}`);

  if (client) {
    try {
      const response = await client.post('send', { version: 'v3.1' }).request({
        Messages: [{
          From: { Email: fromEmail, Name: fromName },
          To: [{ Email: email }],
          Subject: 'Verify your email address',
          TextPart: `Click the link to verify your email: ${verifyUrl}`,
          HTMLPart: `
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
        }],
      });
      console.log(`Verification email sent to ${email}, status: ${response.body?.Messages?.[0]?.Status || 'unknown'}`);
    } catch (error) {
      console.error('Failed to send verification email:', error.response?.data?.ErrorMessage || error.message);
    }
  } else {
    console.log(`Mailjet not configured. Verification link for ${email}: ${verifyUrl}`);
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  console.log(`Password reset email for ${email}: ${resetUrl}`);

  if (client) {
    try {
      const response = await client.post('send', { version: 'v3.1' }).request({
        Messages: [{
          From: { Email: fromEmail, Name: fromName },
          To: [{ Email: email }],
          Subject: 'Reset your password',
          TextPart: `Click the link to reset your password: ${resetUrl}`,
          HTMLPart: `
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
        }],
      });
      console.log(`Password reset email sent to ${email}, status: ${response.body?.Messages?.[0]?.Status || 'unknown'}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error.response?.data?.ErrorMessage || error.message);
    }
  } else {
    console.log(`Mailjet not configured. Reset link for ${email}: ${resetUrl}`);
  }
};