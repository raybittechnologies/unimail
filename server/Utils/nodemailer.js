// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.mail.me.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "zahid.h.khan@icloud.com",
//     pass: "czfj-dtez-ujxk-bdvr",
//   },
// });

// await transporter.sendMail({
//   from: "zahid.h.khan@icloud.com",
//   to: "jasiahassan120@gmail.com",
//   subject: "Email from Apple-authenticated user",
//   html: "<p>Hello from Apple auth</p>",
// });

const nodeMailer = require("nodemailer");

module.exports = class Email {
  constructor(senderEmail, senderAppPassword, receiverMail) {
    this.senderEmail = senderEmail;
    this.senderAppPassword = senderAppPassword;
    this.receiverMail = receiverMail;
  }

  newTransporter() {
    return nodeMailer.createTransport({
      host: "smtp.mail.me.com",
      port: 587,
      secure: false,
      auth: {
        // user: "bvmpxznvv2@privaterelay.appleid.com",
        user: "zahid.h.khan@icloud.com",
        // user: this.senderEmail,
        pass: "czfj-dtez-ujxk-bdvr",
        // pass: this.senderAppPassword,
      },
    });
  }

  async sendEmail(subject, mesage) {
    const mailOPtions = {
      // from: "bvmpxznvv2@privaterelay.appleid.com",
      from: "zahid.h.khan@icloud.com",
      to: this.receiverMail,
      html: mesage,
      subject,
    };

    await this.newTransporter().sendMail(mailOPtions);
  }
};
