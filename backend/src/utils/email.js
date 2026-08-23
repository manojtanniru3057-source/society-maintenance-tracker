const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Society Maintenance Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    // Log but don't crash the app if email fails
    console.error('Email send error:', err.message);
  }
};

const statusChangeEmail = (residentName, complaintTitle, newStatus, note) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
  <div style="background: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0;">Society Maintenance Tracker</h2>
    <p style="margin: 5px 0 0;">Complaint Status Update</p>
  </div>
  <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p>Dear <strong>${residentName}</strong>,</p>
    <p>Your complaint <strong>"${complaintTitle}"</strong> has been updated.</p>
    <div style="background: #f0f0ff; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0;"><strong>New Status:</strong> <span style="color: #4f46e5; font-weight: bold;">${newStatus}</span></p>
      ${note ? `<p style="margin: 8px 0 0;"><strong>Note:</strong> ${note}</p>` : ''}
    </div>
    <p style="color: #666; font-size: 14px;">You can log in to track the full status history of your complaint.</p>
    <p style="color: #999; font-size: 12px; margin-top: 24px;">This is an automated notification from Society Maintenance Tracker.</p>
  </div>
</div>
`;

const importantNoticeEmail = (residentName, noticeTitle, noticeContent) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
  <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0;">⚠ Important Notice</h2>
    <p style="margin: 5px 0 0;">Society Maintenance Tracker</p>
  </div>
  <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <p>Dear <strong>${residentName}</strong>,</p>
    <p>A new important notice has been posted to your society board:</p>
    <div style="background: #fff7ed; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 8px; color: #dc2626;">${noticeTitle}</h3>
      <p style="margin: 0; color: #374151;">${noticeContent}</p>
    </div>
    <p style="color: #666; font-size: 14px;">Log in to view all notices on the notice board.</p>
    <p style="color: #999; font-size: 12px; margin-top: 24px;">This is an automated notification from Society Maintenance Tracker.</p>
  </div>
</div>
`;

module.exports = { sendEmail, statusChangeEmail, importantNoticeEmail };
