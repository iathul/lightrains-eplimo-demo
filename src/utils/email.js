const { transporter } = require('../utils/index')

// Account verification
exports.sendVerificationEmail = async (user, otp) => {
    var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,   
        to: user.email,
        subject: 'Verify your account',
        html: `<h3> Hi ${user.firstName}, </h3>
            <h4> Use this OTP ${otp} to verify your account. </h4>`
    };
    await transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err)
            return err
        } else {
            console.log('Verification email has been sent: ' + info.response)
        }
    })
}

// Forgot password email
exports.sendForgotPasswordEmail = async (user, otp) => {
    var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,   
        to: user.email,
        subject: 'Reset password',
        html: `<h3> Hi ${user.firstName}, </h3>
            <h4> Use this OTP ${otp} to reset your password. </h4>`
    };
    await transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err)
            return err
        } else {
            console.log('Forgot password email has been sent: ' + info.response)
        }
    })
}