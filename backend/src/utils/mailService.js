const nodemailer = require('nodemailer');
const { google } = require('googleapis');

/**
 * GMAIL API SETUP INSTRUCTIONS:
 * 1. Go to Google Cloud Console.
 * 2. Create a project and enable Gmail API.
 * 3. Create OAuth 2.0 Credentials (Client ID and Client Secret).
 * 4. Use Google OAuth2 Playground to get a Refresh Token.
 * 5. Add GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN to .env.
 */

const sendEmail = async (to, subject, text, html) => {
  try {
    // Fallback to console log if credentials are missing
    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_REFRESH_TOKEN) {
      console.log('⚠️ Gmail API credentials missing. Email simulated:');
      console.log(`To: ${to}\nSubject: ${subject}\nText: ${text}`);
      return { success: true, simulated: true };
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // The user who authorized the app
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `Acadexa <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Email Send Error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
