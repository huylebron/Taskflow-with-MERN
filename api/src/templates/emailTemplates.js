export const emailTemplates = {
    verifyEmail: (verificationLink) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #4a90e2;
            color: white;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            background-color: white;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4a90e2;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Taskflow!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up! To complete your registration and start using Taskflow, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationLink}</p>
            
            <p>This verification link will expire in 24 hours.</p>
            
            <p>If you didn't create an account with Taskflow, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>This email was sent by Taskflow. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Taskflow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }