const twilio = require("twilio");

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_ID;

// const client = new twilio(accountSid, authToken);

exports.sendOtp = async (phoneNumber) => {
  const verification = await client.verify.v2
    .services(serviceSid)
    .verifications.create({ to: phoneNumber, channel: "sms" });

  return verification;
};

exports.createVerificationCheck = async (code, to) => {
  const verificationCheck = await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({
      code,
      to,
    });

  return verificationCheck;
};
