const nodemailer = require('nodemailer')

// Create username
exports.getUserName = () => {
  let name = `EP${Math.random().toString(36).substring(2, 9)}`
  return name
}

// Generate and validate otp
exports.generateOtp = () => {
  var digits = '0123456789'
  var otpLength = 6
  var otp = ''

  for(let i=1; i<=otpLength; i++){
    var index = Math.floor(Math.random()*(digits.length))
    otp = otp + digits[index]
  }
  return otp
}

// Nodemailer email transporter
exports.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
})

