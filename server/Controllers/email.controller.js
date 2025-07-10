const { google } = require("googleapis");
const { User } = require("../Models");
const { Client } = require("@microsoft/microsoft-graph-client");
const { catchAsync } = require("../Utils/catchAsync");
const Email = require("../Utils/nodemailer");
const ImapMailer = require("../Utils/imapMailer");
// require("isomorphic-fetch");

exports.getEmails = async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: req.user.access_token });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      q: "in:inbox",
    });

    const messages = response.data.messages || [];

    const emailPromises = messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: ["Subject", "From"],
      });

      const headers = msg.data.payload.headers;
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "No Subject";
      const from =
        headers.find((h) => h.name === "From")?.value || "Unknown Sender";

      return { subject, from };
    });

    const emails = await Promise.all(emailPromises);

    res.render("emails", { emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.send("Error fetching emails");
  }
};

const makeEmailRaw = (from, to, subject, message) => {
  const encodedMessage = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    message,
  ].join("\n");

  return Buffer.from(encodedMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const sendEmailWithGmail = async (accessToken, from, to, subject, message) => {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const raw = makeEmailRaw(from, to, subject, message);

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
};

exports.sendEmail = async (req, res) => {
  try {
    const { id, to, subject, message } = req.body;

    if (!id || !to || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findOne({ where: { id } });
    if (!user || !user.oauth_access_token || user.oauth_provider !== "Google") {
      return res
        .status(404)
        .json({ error: "User not authorized or not found" });
    }

    await sendEmailWithGmail(
      user.oauth_access_token,
      user.email,
      to,
      subject,
      message
    );

    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Failed to send email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
};

//=*===========================================================

function getAuthenticatedClient(accessToken) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

async function sendOutlookEmail(accessToken, from, to, subject, body) {
  const client = getAuthenticatedClient(accessToken);

  await client.api("/me/sendMail").post({
    message: {
      subject,
      body: {
        contentType: "HTML",
        content: body,
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
      from: {
        emailAddress: {
          address: from,
        },
      },
    },
    saveToSentItems: true,
  });

  console.log("✅ Email sent via Microsoft Graph");
}

exports.sendMailMicrosoft = async (req, res) => {
  try {
    const { id, to, subject, message } = req.body;

    const user = await User.findByPk(id);
    if (!user || user.oauth_provider !== "Microsoft") {
      return res.status(404).json({ error: "User not found or not Microsoft" });
    }

    await sendOutlookEmail(
      user.oauth_access_token,
      user.email,
      to,
      subject,
      message
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Outlook email send failed:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
};

exports.sendMailApple = catchAsync(async (req, res) => {
  const { message, subject, id, to } = req.body;

  const userDetails = await User.findOne({ where: { id } });

  const newMailer = new Email(userDetails.email, userDetails.appPassword, to);

  newMailer.sendEmail(subject, message);

  res.status(200).json({
    userDetails,
  });
});

// Generic IMAP/SMTP Email Sending
exports.sendMailImap = catchAsync(async (req, res) => {
  const { id, to, subject, message, options = {} } = req.body;

  // Find user and validate IMAP configuration
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Check if user has IMAP configuration
  if (
    !user.smtp_host ||
    !user.smtp_port ||
    !user.smtp_username ||
    !user.smtp_password
  ) {
    return res.status(400).json({
      error:
        "IMAP/SMTP configuration not found. Please configure your email settings first.",
    });
  }

  // Create SMTP configuration object
  const smtpConfig = {
    host: user.smtp_host,
    port: user.smtp_port,
    username: user.smtp_username,
    password: user.smtp_password,
    secure: user.smtp_secure,
    requireTls: user.smtp_require_tls,
  };

  try {
    // Create IMAP mailer instance
    const imapMailer = new ImapMailer(smtpConfig);

    // Send email
    const result = await imapMailer.sendEmail(
      user.email, // from
      to, // to
      subject, // subject
      message, // message
      options // additional options
    );

    res.status(200).json({
      success: true,
      message: "Email sent successfully via IMAP/SMTP",
      messageId: result.messageId,
      user: {
        id: user.id,
        email: user.email,
        smtp_host: user.smtp_host,
      },
    });
  } catch (error) {
    console.error("IMAP email send failed:", error);
    res.status(500).json({
      error: "Failed to send email via IMAP/SMTP",
      details: error.message,
    });
  }
});

// Verify IMAP/SMTP Connection
exports.verifyImapConnection = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (
    !user.smtp_host ||
    !user.smtp_port ||
    !user.smtp_username ||
    !user.smtp_password
  ) {
    return res.status(400).json({
      error: "IMAP/SMTP configuration not found",
    });
  }

  const smtpConfig = {
    host: user.smtp_host,
    port: user.smtp_port,
    username: user.smtp_username,
    password: user.smtp_password,
    secure: user.smtp_secure,
    requireTls: user.smtp_require_tls,
  };

  try {
    const imapMailer = new ImapMailer(smtpConfig);
    await imapMailer.verifyConnection();

    res.status(200).json({
      success: true,
      message: "SMTP connection verified successfully",
      config: {
        host: user.smtp_host,
        port: user.smtp_port,
        secure: user.smtp_secure,
        requireTls: user.smtp_require_tls,
      },
    });
  } catch (error) {
    console.error("SMTP connection verification failed:", error);
    res.status(500).json({
      error: "Failed to verify SMTP connection",
      details: error.message,
    });
  }
});
