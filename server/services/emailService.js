const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Use app password, not your regular password
  }
});

/**
 * Send email notification
 * @param {string} recipient - Email address to send to
 * @param {string} subject - Email subject
 * @param {string} message - Email body text
 * @returns {Promise} - Email sending result
 */
async function sendEmail(recipient, subject, message) {
  try {
    if (!recipient) {
      console.log('No recipient email provided, skipping notification');
      return { success: false, reason: 'no_recipient' };
    }
    
    const mailOptions = {
      from: `"BookTable App" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
               <h2 style="color: #4a4a4a;">${subject}</h2>
               <p style="font-size: 16px; color: #666;">${message.replace(/\n/g, '<br>')}</p>
               <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                 <p style="font-size: 12px; color: #999;">
                   This is an automated message from BookTable App.
                 </p>
               </div>
             </div>`
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${recipient}, ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${recipient}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };