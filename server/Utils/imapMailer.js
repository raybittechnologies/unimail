const nodemailer = require("nodemailer");

class ImapMailer {
  constructor(smtpConfig) {
    this.smtpConfig = smtpConfig;
  }

  createTransporter() {
    console.log(this.smtpConfig.username, this.smtpConfig.password);
    const config = {
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure, // true for 465, false for other ports

      auth: {
        user: this.smtpConfig.username,
        pass: this.smtpConfig.password,
      },
      requireTLS: this.smtpConfig.requireTls,
      tls: {
        rejectUnauthorized: false, // Only use this in development
      },
    };

    return nodemailer.createTransport(config);
  }

  async sendEmail(from, to, subject, message, options = {}) {
    try {
      const transporter = this.createTransporter();

      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: message,
        ...options,
      };

      const info = await transporter.sendMail(mailOptions);

      console.log("✅ Email sent successfully via IMAP/SMTP");
      console.log("Message ID:", info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      console.error("❌ Failed to send email via IMAP/SMTP:", error);
      throw error;
    }
  }

  async verifyConnection() {
    try {
      const transporter = this.createTransporter();
      await transporter.verify();
      console.log("✅ SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("❌ SMTP connection verification failed:", error);
      throw error;
    }
  }
}

module.exports = ImapMailer;
