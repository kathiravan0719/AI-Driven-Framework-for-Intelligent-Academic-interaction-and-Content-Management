const nodemailer = require("nodemailer");

// Reusable transporter (created once per server lifetime)
let transporter = null;
let isEthereal = false;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Use Gmail if both EMAIL_USER and EMAIL_PASSWORD are set in .env
  const hasGmailCreds = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

  if (hasGmailCreds) {
    // Production: use real Gmail SMTP credentials (App Password)
    console.log(`📧 Email: Configuring Gmail SMTP for ${process.env.EMAIL_USER}`);
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // allow self-signed certs in dev
      }
    });
    isEthereal = false;
  } else {
    // Development fallback: use Ethereal test account
    console.log('📧 Email: No credentials found — using Ethereal test account');
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
    isEthereal = true;
  }

  return transporter;
};

/**
 * Verifies the email transporter connection.
 * Logs success or detailed error without crashing the server.
 * Resets the cached transporter on failure so it can be retried.
 */
const verifyConnection = async () => {
  try {
    const t = await getTransporter();
    await t.verify();
    
    if (isEthereal) {
      console.log('✉️  Email Service: [TEST MODE] Connected to Ethereal — emails will NOT be delivered to real inboxes.');
    } else {
      console.log(`✉️  Email Service: [LIVE] Connected as ${process.env.EMAIL_USER} ✅`);
    }
    return true;
  } catch (error) {
    // Reset cached transporter so it is not reused in a broken state
    transporter = null;

    console.error('\n❌ Email Service Connection Failed!');
    console.error(`❌ Error: ${error.message}`);
    if (error.code === 'EAUTH') {
      console.error('❌ CAUSE: Gmail rejected the App Password.');
      console.error('❌ FIX: Go to https://myaccount.google.com/apppasswords and generate a new 16-char App Password.');
      console.error('❌ Then update EMAIL_PASSWORD in backend/.env and restart the server.');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('❌ CAUSE: Could not reach the SMTP server. Check your internet connection.');
    }
    console.error('⚠️  Application will continue running, but email features will be unavailable.\n');
    return false;
  }
};

const sendEmail = async (options) => {
  try {
    const t = await getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@college-cms.test',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await t.sendMail(mailOptions);

    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`\n📧 [EMAIL SENT TO: ${options.to}]`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Preview URL: ${previewUrl}\n`);
    } else {
      console.log("✅ Email sent:", info.messageId);
    }

    return info;
  } catch (error) {
    console.error("\n❌ Email sending failed!");
    console.error(`❌ Error Message: ${error.message}`);
    if (error.code) console.error(`❌ Error Code: ${error.code}`);
    if (error.response) console.error(`❌ SMTP Response: ${error.response}`);
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