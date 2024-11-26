const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // E.g., 'smtp.gmail.com'
      port: process.env.SMTP_PORT || 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER, // Your SMTP username
        pass: process.env.SMTP_PASSWORD, // Your SMTP password
      },
    });

    // Email options
    const mailOptions = {
      from: `"Andy Dale Project" <${process.env.SMTP_USER}>`, // Sender address
      to, // Recipient email address
      subject, // Subject line
      text, // Plain text body
      html, // HTML body (optional)
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

module.exports = sendEmail;