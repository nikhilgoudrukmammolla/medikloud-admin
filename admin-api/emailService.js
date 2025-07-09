// Email service for sending welcome emails and verification emails
// In production, you would use services like SendGrid, Mailgun, AWS SES, etc.

const nodemailer = require('nodemailer');

// Configure email transporter
// For production, use environment variables for credentials
const createTransporter = () => {
  // Example for Gmail (you'll need to enable 2FA and use app passwords)
  // return nodemailer.createTransporter({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASSWORD
  //   }
  // });

  // Example for SendGrid
  // return nodemailer.createTransporter({
  //   host: 'smtp.sendgrid.net',
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: 'apikey',
  //     pass: process.env.SENDGRID_API_KEY
  //   }
  // });

  // For development, use a test account or log emails
  return {
    sendMail: async (options) => {
      console.log('=== EMAIL WOULD BE SENT ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('HTML:', options.html);
      console.log('===========================');
      return { messageId: 'test-message-id' };
    }
  };
};

const transporter = createTransporter();

// Email templates
const getWelcomeEmailTemplate = (email, password, role) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to MediKloud Admin Portal</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
        .warning { background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800; }
        .button { display: inline-block; background: #2196f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to MediKloud Admin Portal</h1>
            <p>Your account has been created successfully</p>
        </div>
        
        <div class="content">
            <h2>Hello!</h2>
            <p>Your account has been created in the MediKloud Admin Portal with the role of <strong>${role}</strong>.</p>
            
            <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${password}</p>
                <p><strong>Role:</strong> ${role}</p>
            </div>
            
            <div class="warning">
                <h4>⚠️ Important Security Steps:</h4>
                <ol>
                    <li><strong>Verify your email</strong> - Click the verification link sent to your email</li>
                    <li><strong>Change your password</strong> - You'll be prompted to change your password on first login</li>
                    <li><strong>Keep credentials secure</strong> - Don't share your login information</li>
                </ol>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Check your email for a verification link and click it</li>
                <li>Go to the admin portal and sign in with your credentials</li>
                <li>You'll be prompted to change your password immediately</li>
                <li>Start using the admin portal!</li>
            </ol>
            
            <p>If you have any questions, please contact your system administrator.</p>
            
            <div class="footer">
                <p>This is an automated message from the MediKloud Admin Portal.</p>
                <p>Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

const getVerificationEmailTemplate = (email, verificationLink) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email - MediKloud Admin Portal</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email Address</h1>
            <p>MediKloud Admin Portal</p>
        </div>
        
        <div class="content">
            <h2>Hello!</h2>
            <p>Please verify your email address (${email}) to complete your account setup.</p>
            
            <p>Click the button below to verify your email:</p>
            
            <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
            
            <p><strong>Note:</strong> This link will expire in 24 hours for security reasons.</p>
            
            <div class="footer">
                <p>This is an automated message from the MediKloud Admin Portal.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Email sending functions
const sendWelcomeEmail = async (email, password, role) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@medikloud.com',
      to: email,
      subject: 'Welcome to MediKloud Admin Portal - Your Account Details',
      html: getWelcomeEmailTemplate(email, password, role)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

const sendVerificationEmail = async (email, verificationLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@medikloud.com',
      to: email,
      subject: 'Verify Your Email - MediKloud Admin Portal',
      html: getVerificationEmailTemplate(email, verificationLink)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  createTransporter
}; 