import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "tafinasoalabs@gmail.com",
    pass: "codeace34TT",
    clientId:
      process.env.CLIENT_ID,
    clientSecret: process.env.MAIL_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
} as unknown as SMTPTransport.Options);
