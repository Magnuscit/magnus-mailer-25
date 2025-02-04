import * as AWS from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";

const ses = new AWS.SES({
  apiVersion: "2010-12-01",
  region: process.env.REGION || "",
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY || "",
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY || "",
  },
});

const transporter = nodemailer.createTransport({
  SES: { ses, aws: AWS },
});

export default transporter;
