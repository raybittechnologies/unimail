const { ensureAuthenticated } = require("../Controllers/auth.controller");
const {
  getEmails,
  sendEmail,
  sendMailMicrosoft,
  sendMailApple,
  sendMailImap,
  verifyImapConnection,
} = require("../Controllers/email.controller");

const EmailRouter = require("express").Router();

EmailRouter.get("/", ensureAuthenticated, getEmails);
EmailRouter.get("/ms", ensureAuthenticated);
EmailRouter.post("/send-email-google", sendEmail);
EmailRouter.post("/send-email-microsoft", sendMailMicrosoft);
EmailRouter.post("/send-email-apple", sendMailApple);
EmailRouter.post("/send-email-imap", sendMailImap);
EmailRouter.get("/verify-imap/:id", verifyImapConnection);

module.exports = EmailRouter;
