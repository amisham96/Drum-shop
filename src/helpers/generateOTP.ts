/*
  File: generateOTP.ts
  Description: This file contains a single function that generates a
  6 digit otp
*/

function generateOTP() {
  // Generates a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000); 
  return otp.toString();
}

export default generateOTP;
