import * as AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.SES_ACCESS_KEY,
  secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const ses = new AWS.SES({
  apiVersion: "2010-12-01",
});

export default ses;
