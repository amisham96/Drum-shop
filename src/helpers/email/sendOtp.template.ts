const sendSignUpOtpTemplate = (otp: string) => {
  const html = `
    <html>
      <head>
        <title>Welcome to The Bangalore Drum Shop</title>
      </head>
      <body>
        <h1 style="text-align: center; color:#3D4F58;">
          One Time Password (OTP) for your 'The Bangalore Drum Shop' account
        </h1>
        
        <p style="text-align: center;">Hi there 👋,</p>
        <p style="text-align: center; margin-top: -15px;">
          Please enter the below code to complete the verification
        </p>
        
        <h1 style="text-align: center;">${otp}</h1>
        
        <p style="text-align: center; color: #808080; font-size: 0.7rem">
          Valid for the next 3 minutes
        </p>
        
        <p style="text-align: center; color: #808080; font-size: 0.7rem">
          Please do not share this OTP with anyone for security reasons.
        </p>
      </body>
    </html>
  `;

  const plainText = `Please enter the otp to complete verification - ${otp}`;

  return { html, plainText };
};

export {
  sendSignUpOtpTemplate
}