const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"LUXE Clothing" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`✉️ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email Error:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Welcome to LUXE</title></head>
    <body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f8f8;margin:0;padding:0;">
      <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:48px 40px;text-align:center;">
          <h1 style="color:#fff;font-size:36px;letter-spacing:8px;margin:0;font-weight:300;">LUXE</h1>
          <p style="color:rgba(255,255,255,0.6);margin:8px 0 0;letter-spacing:3px;font-size:11px;text-transform:uppercase;">Premium Clothing</p>
        </div>
        <div style="padding:48px 40px;">
          <h2 style="color:#1a1a2e;font-size:24px;font-weight:600;margin:0 0 16px;">Welcome, ${user.name}! 🎉</h2>
          <p style="color:#666;font-size:16px;line-height:1.7;margin:0 0 24px;">
            Thank you for joining LUXE. You're now part of an exclusive community that appreciates premium fashion and timeless style.
          </p>
          <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#1a1a2e;color:#fff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;letter-spacing:2px;text-transform:uppercase;font-weight:500;">
            Start Shopping
          </a>
        </div>
        <div style="background:#f8f8f8;padding:24px 40px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">© 2024 LUXE Clothing. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail({ to: user.email, subject: 'Welcome to LUXE — Your Journey Begins', html });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f8f8;margin:0;padding:0;">
      <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:40px;text-align:center;">
          <h1 style="color:#fff;font-size:36px;letter-spacing:8px;margin:0;font-weight:300;">LUXE</h1>
        </div>
        <div style="padding:48px 40px;">
          <h2 style="color:#1a1a2e;font-size:22px;font-weight:600;margin:0 0 16px;">Reset Your Password</h2>
          <p style="color:#666;font-size:15px;line-height:1.7;margin:0 0 24px;">
            You requested a password reset. Click the button below to create a new password. This link expires in 10 minutes.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:14px;letter-spacing:2px;text-transform:uppercase;">
            Reset Password
          </a>
          <p style="color:#999;font-size:13px;margin-top:24px;">If you didn't request this, ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail({ to: user.email, subject: 'LUXE — Password Reset Request', html });
};

const sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;">${item.size} / ${item.color}</td>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;">₹${item.price}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f8f8;margin:0;padding:0;">
      <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:40px;text-align:center;">
          <h1 style="color:#fff;font-size:36px;letter-spacing:8px;margin:0;font-weight:300;">LUXE</h1>
        </div>
        <div style="padding:48px 40px;">
          <h2 style="color:#1a1a2e;margin:0 0 8px;">Order Confirmed! ✅</h2>
          <p style="color:#666;margin:0 0 24px;">Order #${order.orderNumber}</p>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f8f8f8;">
                <th style="padding:12px;text-align:left;font-size:13px;color:#999;">Item</th>
                <th style="padding:12px;text-align:left;font-size:13px;color:#999;">Variant</th>
                <th style="padding:12px;text-align:left;font-size:13px;color:#999;">Qty</th>
                <th style="padding:12px;text-align:left;font-size:13px;color:#999;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align:right;margin-top:16px;padding-top:16px;border-top:2px solid #1a1a2e;">
            <p style="font-size:18px;font-weight:700;color:#1a1a2e;">Total: ₹${order.pricing.total}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail({ to: user.email, subject: `LUXE — Order ${order.orderNumber} Confirmed`, html });
};

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendOrderConfirmationEmail };
