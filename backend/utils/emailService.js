const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    try {
      const validPassword = process.env.EMAIL_PASSWORD && 
                            process.env.EMAIL_PASSWORD !== 'paste_your_16_char_app_password_here' && 
                            process.env.EMAIL_PASSWORD !== 'abcdefghijklmnop';

      if (process.env.EMAIL_USER && validPassword) {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: process.env.EMAIL_PORT || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        console.log('✉️  Real Email Service Ready!');
      } else {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log('✉️  Ethereal Email Service Ready (Testing Mode)!');
        console.log(`   User: ${testAccount.user}`);
      }
    } catch (err) {
      console.error('Failed to init email service', err);
    }
  }

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@collegeforum.com',
        to: user.email,
        subject: 'Welcome to AI College CMS! 🎓',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Welcome, ${user.name}! 🎉</h1>
            <p>Thank you for joining our AI-Driven College Interaction & Content Management System.</p>
            <p>You can now:</p>
            <ul>
              <li>✅ Create and share posts</li>
              <li>✅ Connect with students</li>
              <li>✅ Get AI-powered recommendations</li>
              <li>✅ Participate in discussions</li>
            </ul>
            <a href="${process.env.CLIENT_URL}/feed" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Start Exploring
            </a>
            <p style="margin-top: 30px; color: #666;">
              Best regards,<br>
              The College Forum Team
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', user.email);
    } catch (error) {
      console.error('Email send error:', error);
    }
  }

  async sendNotificationEmail(user, notification) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@collegeforum.com',
        to: user.email,
        subject: notification.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">${notification.title}</h2>
            <p>${notification.message}</p>
            <a href="${process.env.CLIENT_URL}${notification.link}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              View Details
            </a>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      if (!process.env.EMAIL_USER) {
        console.log(`\n📧 [NOTIFICATION EMAIL SENT TO: ${user.email}]`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}\n`);
      }
    } catch (error) {
      console.error('Notification email error:', error);
    }
  }

  async sendContentModerationAlert(admin, post) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@collegeforum.com',
        to: admin.email,
        subject: '⚠️ Content Requires Moderation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Content Moderation Alert</h2>
            <p>A post has been flagged by our AI moderation system:</p>
            <div style="background: #fee; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
              <h3>${post.title}</h3>
              <p>${post.content.substring(0, 200)}...</p>
            </div>
            <p><strong>Flagged for:</strong> ${post.moderationFlags.map(f => f.reason).join(', ')}</p>
            <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Review Now
            </a>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Moderation alert email error:', error);
    }
  }
}

module.exports = new EmailService();