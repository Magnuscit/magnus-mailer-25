import QRCode from "qrcode";
import { ses } from "./config";

const sendBoardingPass = async (
  userEmail: string,
  userName: string,
  userClg: string,
  eventName: string,
) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(userEmail);
    const base64QR = qrDataUrl.split(",")[1];

    const plainText = `Hi ${userName},

Congratulations! You are now officially registered for ${eventName} at Magnus'25!
Your boarding pass is attached to this email.

Best regards,
Team Magnus
CSE-AIML
Chennai Institute of Technology`;

    const htmlContent = `
<html>
  <body>
    <div style="box-sizing: border-box; background: gray; padding: 3%;">
      <table id="content" style="background: white; width: 100%">
         <tr style="height: 15vh">
            <td>&nbsp;</td>
            <td colspan="2" align="center">
               <img src="https://ik.imagekit.io/lovelin/magnus%20mail.png?updatedAt=1738836507322" alt="logo"/>
            </td>
            <td>&nbsp;</td>
         </tr>
         <tr style="font-size: 1.2em">
            <td colspan="4" style="font-family: monospace; vertical-align: center; padding: 2em">
              <p>
                Hi ${userName},<br><br>
                Congratulations!🎉 You are now officially registered for <strong>${eventName}</strong> at Magnus'25! 🎟️✨ Get ready to showcase your skills, explore new ideas, and experience an event like never before.<br><br>
                <li>Your event pass is attached to this mail</li>
                <li>Check our website for event rules, regulations, and schedules</li>
                <br>
                We can’t wait to see you in action! Let’s make this an unforgettable experience. 🎉<br><br>
                Best regards,<br><br>
                Team Magnus<br>
                CSE-AIML<br>
                Chennai Institute of Technology
              </p>
            </td>
         </tr>
         <tr>
            <td colspan="4" align="center">
              <div style="font-family: monospace;">
                <div style="display: flex; max-width: 750px; max-height: 277px;">
                  <div style="width:70%; border:2px dashed #a0a0a0; border-radius: 15px; text-align: left; padding: 10px;">
                     <p style="font-size: 10px; margin: 6px 0 0 10px;">Boarding<br/>Date: 17 Feb 2025</p>
                     <p style="font-size: 10px; margin: 8px 0 0 10px;">from ${userClg} to Chennai Institute of Technology</p>
                     <p style="font-size: 20px; margin: 50px 0 0 5px;">${eventName}</p>
                  </div>
                  <div style="background: #ececec; border-radius: 15px; width: 30%; padding: 40px 10px;">
                     <p>
                       <img alt="qr" width="172px" height="172px" src="cid:qr">
                     </p>
                     <img src="https://ik.imagekit.io/lovelin/magnus%20mail.png?updatedAt=1738836507322" alt="logo" width="136px" height="32px">
                  </div>
                </div>
              </div>
            </td>
         </tr>
         <tr style="vertical-align: top">
            <td style="font-family: monospace; padding: 2em; width: 25%;">
              <div style="text-align: justify">
                 <p style="margin: 4px"><b>Contact</b></p>
                 <p style="margin: 2px">9566189965</p>
                 <p style="margin: 2px">8248493521</p>
              </div>
            </td>
            <td style="font-family: monospace; padding: 2em; width: 25%;">
              <div style="text-align: justify">
                 <p style="margin: 4px"><b>Email</b></p>
                 <p style="margin: 2px">magnus@citchennai.net</p>
              </div>
            </td>
            <td style="font-family: monospace; padding: 2em; width: 25%;">
              <div style="text-align: justify">
                 <p style="margin: 4px"><b>Visit Us</b></p>
                 <p style="margin: 2px"><a href="https://magnuscit.live">www.magnuscit.live</a></p>
              </div>
            </td>
            <td style="font-family: monospace; padding: 2em; width: 25%;">
              <p style="margin: 4px"><b>Socials</b></p>
              <div style="display: flex; justify-content: left; margin: 4px;">
                 <a href="https://www.linkedin.com/in/magnus-cit-7158a2287">
                   <img alt="F" src="https://www.shareicon.net/data/2015/09/28/108616_media_512x512.png" style="width: 15px; height: 15px; padding: 2px"/>
                 </a>
                 <a href="https://www.instagram.com/@magnus.cit">
                   <img alt="I" src="https://raw.githubusercontent.com/cittakshashila/backend/ses/docs/asserts/insta.png" style="width: 15px; height: 15px; padding: 2px"/>
                 </a>
              </div>
            </td>
         </tr>
         <tr>
            <td colspan="4" style="font-family: monospace; padding: 2em">
              <p style="text-align: center">
                 © 2025 Magnus. All rights reserved.
              </p>
            </td>
         </tr>
      </table>
    </div>
  </body>
</html>`;

    const boundaryMixed = "NextPartMixedBoundary";
    const boundaryRelated = "NextPartRelatedBoundary";
    const boundaryAlternative = "NextPartAlternativeBoundary";

    const rawEmail = [
      `From: ${process.env.SES_VERIFIED_EMAIL}`,
      `To: ${userEmail}`,
      `Subject: Welcome to ${eventName} at Magnus'25! 🚀`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundaryMixed}"`,
      ``,
      `--${boundaryMixed}`,
      `Content-Type: multipart/related; boundary="${boundaryRelated}"`,
      ``,
      `--${boundaryRelated}`,
      `Content-Type: multipart/alternative; boundary="${boundaryAlternative}"`,
      ``,
      `--${boundaryAlternative}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      plainText,
      ``,
      `--${boundaryAlternative}`,
      `Content-Type: text/html; charset="UTF-8"`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      htmlContent,
      ``,
      `--${boundaryAlternative}--`,
      ``,
      `--${boundaryRelated}`,
      `Content-Type: image/png; name="qr_inline.png"`,
      `Content-Transfer-Encoding: base64`,
      `Content-Disposition: inline; filename="qr_inline.png"`,
      `Content-ID: <qr>`,
      ``,
      base64QR,
      ``,
      `--${boundaryRelated}--`,
      ``,
      `--${boundaryMixed}`,
      `Content-Type: image/png; name="${userName}-qr.png"`,
      `Content-Transfer-Encoding: base64`,
      `Content-Disposition: attachment; filename="${userName}-qr.png"`,
      ``,
      base64QR,
      ``,
      `--${boundaryMixed}--`,
    ].join("\n");

    const params = {
      Source: process.env.SES_VERIFIED_EMAIL,
      Destinations: [userEmail],
      RawMessage: { Data: rawEmail },
    };

    await ses.sendRawEmail(params).promise();
    console.log(`Boarding pass sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending boarding pass to ${userEmail}:`, error);
  }
};

const sendConfirmation = async (
  userEmail: string,
  userName: string,
  eventName: string,
) => {
  const plainText = `Hi ${userName},

We have received your registration for ${eventName} at Magnus'25!
We are currently processing your payment (if applicable) and verifying your details. Please wait a little while as we complete the verification.
Once your registration is confirmed by our end, we will send you your boarding pass via email.
Important: Sometimes our emails may end up in your spam folder. Please check there if you don’t receive a confirmation soon!

Best regards,
Team Magnus
CSE-AIML
Chennai Institute of Technology`;

  const htmlContent = `
<html>
   <div style="box-sizing: border-box; background: gray; padding: 3%;">
      <table id="content" colspan="4" style="background: white; width: 100%">
         <tr style="height: 15vh">
            <td>&nbsp;</td>
            <td colspan="2" align="center">
               <img src="https://ik.imagekit.io/lovelin/magnus%20mail.png?updatedAt=1738836507322" alt="logo"/>
            </td>
            <td>&nbsp;</td>
         </tr>
         <tr style="font-size: 1.2em">
            <td colspan="4" style="font-family: monospace; vertical-align: center; padding: 2em">
               <p>
                  Hi ${userName},
                  <br><br>
                  We have received your registration for <strong>${eventName}</strong> at Magnus'25! 🎉  
                  We are currently <strong>processing your payment</strong> (if applicable) and verifying your details. Please wait a little while as we complete the verification.  
                  <br><br>
                  Once your registration is confirmed by our end, we will send you your <strong>boarding pass</strong> via email. 📩  
                  <br><br>
                  <strong>Important:</strong> Sometimes our emails may end up in your spam folder. Please check there if you don’t receive a confirmation soon!  
                  <br><br>
                  Thank you for your patience! 🙌  
                  <br><br>
                  Best regards,  
                  <br>
                  Team Magnus 
                  <br>
                  CSE-AIML
                  <br>
                  Chennai Institute of Technology
               </p>
            </td>
         </tr>
         <tr style="vertical-align: top">
            <td style="font-family: monospace; vertical-align: middle; padding: 2em; width: 25%;">
               <div style="text-align: justify">
                  <p style="margin: 4px"><b>Contact</b></p>
                  <p style="margin: 2px">9566189965</p>
                  <p style="margin: 2px">8248493521</p>
               </div>
            </td>
            <td style="font-family: monospace; vertical-align: middle; padding: 2em; width: 25%;">
               <div style="text-align: justify">
                  <p style="margin: 4px"><b>Email</b></p>
                  <p style="margin: 2px">magnus@citchennai.net</p>
               </div>
            </td>
            <td style="font-family: monospace; vertical-align: middle; padding: 2em; width: 25%;">
               <div style="text-align: justify">
                  <p style="margin: 4px"><b>Visit Us</b></p>
                  <p style="margin: 2px"><a href="https://magnuscit.live">www.magnuscit.live</a></p>
               </div>
            </td>
            <td style="font-family: monospace; vertical-align: middle; padding: 2em; width: 25%;">
               <p style="margin: 4px"><b>Socials</b></p>
               <div style="display: flex; justify-content: left; margin: 4px; text-align: justify;">
                  <a href="https://www.linkedin.com/in/magnus-cit-7158a2287">
                  <img alt="F" src="https://www.shareicon.net/data/2015/09/28/108616_media_512x512.png" style="width: 15px; height: 15px; padding: 2px"/>
                  </a>
                  <a href="https://www.instagram.com/magnus.cit">
                  <img alt="I" src="https://raw.githubusercontent.com/cittakshashila/backend/ses/docs/asserts/insta.png" style="width: 15px; height: 15px; padding: 2px"/>
                  </a>
               </div>
            </td>
         </tr>
         <tr>
            <td colspan="4" style="font-family: monospace; vertical-align: center; padding: 2em">
               <p style="text-align: center">
                  © 2025 Magnus. All rights reserved.
               </p>
            </td>
         </tr>
      </table>
   </div>
</html>
`;

  const boundary = "NextPartBoundary";

  const rawEmail = [
    `From: ${process.env.SES_VERIFIED_EMAIL}`,
    `To: ${userEmail}`,
    `Subject: Registration confirmation for ${eventName} at Magnus'25! 🚀`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    plainText,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    htmlContent,
    ``,
    `--${boundary}--`,
  ].join("\n");

  try {
    const params = {
      Source: process.env.SES_VERIFIED_EMAIL,
      Destinations: [userEmail],
      RawMessage: { Data: rawEmail },
    };

    await ses.sendRawEmail(params).promise();
    console.log(`Confirmation sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending confirmation email to ${userEmail}:`, error);
  }
};

const sendRejection = async (
  userEmail: string,
  userName: string,
  eventName: string,
) => {
  const plainText = `Hi ${userName},

We regret to inform you that we could not verify the payment and/or the identification information you provided for ${eventName} at Magnus'25.

This means that we are currently unable to confirm your registration for the event. If you believe this is a mistake or if you have additional documentation, please get in touch with us as soon as possible.

Note: You can reply to this email or contact our support directly using the details below.

Thank you for your understanding.

Best regards,
Team Magnus
CSE-AIML
Chennai Institute of Technology`;

  const htmlContent = `
<html>
   <div style="box-sizing: border-box; background: gray; padding: 3%;">
      <table id="content" colspan="4" style="background: white; width: 100%">
         <tr style="height: 15vh">
            <td>&nbsp;</td>
            <td colspan="2" align="center">
               <img src="https://ik.imagekit.io/lovelin/magnus%20mail.png?updatedAt=1738836507322" alt="logo"/>
            </td>
            <td>&nbsp;</td>
         </tr>
         <tr style="font-size: 1.2em">
            <td colspan="4" style="font-family: monospace; vertical-align: center; padding: 2em">
               <p>
                  Hi ${userName},
                  <br><br>
                  We regret to inform you that we could not verify the payment and/or the identification information you provided for <strong>${eventName}</strong> to Magnus'25.
                  <br><br>
                  This means that we are currently unable to confirm your registration for the event. If you believe this is a mistake or if you have additional documentation, please get in touch with us as soon as possible.
                  <br><br>
                  <strong>Note:</strong> You can reply to this email or contact our support directly using the details below
                  <br><br>
                  Thank you for your understanding.
                  <br><br>
                  Best regards,
                  <br>
                  Team Magnus 
                  <br>
                  CSE-AIML
                  <br>
                  Chennai Institute of Technology
               </p>
            </td>
         </tr>
         <tr style="vertical-align: top">
            <td style="font-family: monospace; vertical-align: middle; padding: 2em; width: 25%;">
               <div style="text-align: justify">
                  <p style="margin: 4px"><b>Contact</b></p>
                  <p style="margin: 2px">9566189965</p>
                  <p style="margin: 2px">8248493521</p>
               </div>
            </td>
            <td style="font-family: monospace; vertical-align: middle; padding: 2em; width: 25%;">
               <div style="text-align: justify">
                  <p style="margin: 4px"><b>Email</b></p>
                  <p style="margin: 2px">magnus@citchennai.net</p>
               </div>
            </td>
            <td style="font-family: monospace; vertical-align: middle; padding: 2em; width: 25%;">
               <div style="text-align: justify">
                  <p style="margin: 4px"><b>Visit Us</b></p>
                  <p style="margin: 2px"><a href="https://magnuscit.live">www.magnuscit.live</a></p>
               </div>
            </td>
            <td style="font-family: monospace; vertical-align: middle; padding: 2em; width: 25%;">
               <p style="margin: 4px"><b>Socials</b></p>
               <div style="display: flex; justify-content: left; margin: 4px; text-align: justify;">
                  <a href="https://www.linkedin.com/in/magnus-cit-7158a2287">
                     <img alt="LinkedIn" src="https://www.shareicon.net/data/2015/09/28/108616_media_512x512.png" style="width: 15px; height: 15px; padding: 2px"/>
                  </a>
                  <a href="https://www.instagram.com/magnus.cit">
                     <img alt="Instagram" src="https://raw.githubusercontent.com/cittakshashila/backend/ses/docs/asserts/insta.png" style="width: 15px; height: 15px; padding: 2px"/>
                  </a>
               </div>
            </td>
         </tr>
         <tr>
            <td colspan="4" style="font-family: monospace; vertical-align: center; padding: 2em">
               <p style="text-align: center">
                  © 2025 Magnus. All rights reserved.
               </p>
            </td>
         </tr>
      </table>
   </div>
</html>
`;

  const boundary = "NextPartBoundary";

  const rawEmail = [
    `From: ${process.env.SES_VERIFIED_EMAIL}`,
    `To: ${userEmail}`,
    `Subject: Registration Issue for ${eventName} at Magnus'25 – Action Required`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    plainText,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    htmlContent,
    ``,
    `--${boundary}--`,
  ].join("\n");

  try {
    const params = {
      Source: process.env.SES_VERIFIED_EMAIL,
      Destinations: [userEmail],
      RawMessage: { Data: rawEmail },
    };

    await ses.sendRawEmail(params).promise();
    console.log(`Rejection sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending rejection to email: ${userEmail}:`, error);
  }
};

export { sendBoardingPass, sendConfirmation, sendRejection };
