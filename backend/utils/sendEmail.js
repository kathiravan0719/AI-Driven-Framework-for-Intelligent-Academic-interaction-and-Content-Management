const { Resend } = require('resend');

// Initialize Resend
let resendClient = null;

const getResendClient = () => {
  if (resendClient) return resendClient;
  
  if (process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log('📧 Email Service: Configured with Resend');
  } else {
    console.warn('⚠️  Email Service: RESEND_API_KEY is missing from .env. Emails will not be sent.');
  }
  
  return resendClient;
};

const verifyConnection = async () => {
  const client = getResendClient();
  if (client) {
    console.log('✉️  Email Service: [LIVE] Connected to Resend API ✅');
    return true;
  }
  console.error('\n❌ Email Service Connection Failed!');
  console.error('❌ CAUSE: Missing RESEND_API_KEY in .env file.');
  console.error('❌ FIX: Go to https://resend.com, create an API key, and add it to backend/.env');
  console.error('⚠️  Application will continue running, but email features will be unavailable.\n');
  return false;
};

const sendEmail = async (options) => {
  try {
    const client = getResendClient();
    
    if (!client) {
      console.log(`\n📧 [EMAIL SKIPPED: ${options.to}]`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Reason: No RESEND_API_KEY configured.\n`);
      return null;
    }

    const data = await client.emails.send({
      from: process.env.EMAIL_FROM || 'AI College CMS <onboarding@resend.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (data.error) {
      throw new Error(data.error.message);
    }

    console.log("✅ Email sent successfully via Resend. ID:", data.data?.id);
    return data;
  } catch (error) {
    console.error("\n❌ Email sending failed via Resend!");
    console.error(`❌ Error Message: ${error.message}`);
    throw error;
  }
};

// Predefined email templates
sendEmail.welcome = async (user) => {
  return sendEmail({
    to: user.email,
    subject: "Welcome to AI College CMS! 🎓",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; padding: 12px 20px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; color: white; font-size: 24px; font-weight: 700;">🎓 AI College CMS</div>
        </div>
        <h1 style="color: #1e293b; font-size: 24px; text-align: center; margin-bottom: 8px;">Welcome, ${user.name}!</h1>
        <p style="color: #64748b; text-align: center; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Your account has been created successfully. Start exploring the community!
        </p>
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="color: #475569; margin: 0 0 8px;"><strong>Your Details:</strong></p>
          <p style="color: #64748b; margin: 4px 0;">📧 Email: ${user.email}</p>
          <p style="color: #64748b; margin: 4px 0;">🎭 Role: ${user.role || 'Student'}</p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/feed" 
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
            Explore the Feed →
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">AI College CMS — Connect, Learn, Grow</p>
      </div>
    `,
  });
};

sendEmail.commentNotification = async (postOwner, commenterName, postTitle, postId) => {
  return sendEmail({
    to: postOwner.email,
    subject: `${commenterName} commented on your post — AI College CMS`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1e293b; margin: 0;">💬 New Comment</h2>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 4px;">
            <strong style="color: #1e293b;">${commenterName}</strong> commented on your post:
          </p>
          <p style="color: #3b82f6; font-weight: 600; margin: 8px 0 0;">"${postTitle}"</p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/post/${postId}" 
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Comment
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">AI College CMS</p>
      </div>
    `,
  });
};

sendEmail.verifyConnection = verifyConnection;

module.exports = sendEmail;