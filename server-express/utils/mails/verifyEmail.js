export const verificationEmailTemplate = (name, verificationLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f2f2f2;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <tr>
      <td style="text-align: center;">
        <h1 style="color: #1D4ED8; margin-bottom: 20px;">Interview IQ</h1>
        <p style="font-size: 16px; color: #555555; margin-bottom: 30px;">Hello ${name},</p>
        <p style="font-size: 16px; color: #555555; margin-bottom: 30px;">Please verify your email to activate your account.</p>
        <a href="${verificationLink}" style="background-color: #1D4ED8; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold;">Verify Email</a>
        <p style="font-size: 14px; color: #888888; margin-top: 30px;">If you didn't request this, you can ignore this email.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
