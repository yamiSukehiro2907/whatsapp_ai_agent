require("dotenv").config();
const Twilio = require("twilio");

const twilioAccountAid = process.env.TWILIO_ACCOUNT_SID1;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN1;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new Twilio(twilioAccountAid, twilioAuthToken);


module.exports = { client, twilioPhoneNumber };
