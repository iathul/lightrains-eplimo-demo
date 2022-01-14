'use strict'

const User = require('../models/userModel.js')
const OTP = require('../models/otpModel')
const { 
  getUserName, 
  generateOtp,
} = require('../utils/index')
const validationSchema = require('../schema/userSchema')
const { 
  sendVerificationEmail,
  sendForgotPasswordEmail
} = require('../utils/email')


module.exports = async function (fastify, opts) {
  // User registration
  fastify.post(
    '/register',
    { schema: validationSchema.userRegistrationSchema },
    async function (request, reply) {
      try {
        const { firstName, lastName, role, email, phoneNumber, password } =
          request.body

        // Create unique username
        const userName = getUserName()

        const userData = {
          firstName: firstName,
          lastName: lastName,
          userName: userName,
          role: role,
          email: email,
          phoneNumber: phoneNumber,
          password: password
        }
        const userModel = new User(userData)
        // Check user exists or not
        const user = await userModel.getUserByEmail(email)
        if (user) {
          return reply.error({ message: 'User already exists' })
        }
        // Create new user
        const newUser = await userModel.save()
        if (!newUser) {
          reply.error({ message: 'Registration failed. Please try again' })
        } else {
          // Generate and save otp
          const otp = generateOtp()
          const otpData = {
            otpNumber: otp,
            user: newUser._id
          }
          const otpModel = new OTP(otpData)
          await otpModel.save()

          reply.success({
            message: 'Registration success.'
          })

          // Send verification email
          await sendVerificationEmail(newUser, otp)
        }
      } catch (err) {
        console.log(err)
        reply.error({ message: err.message })
      }
      return reply
    }
  ),
    // Verify otp
    fastify.post(
      '/verify',
      { schema: validationSchema.userOtpVerificationSchema },
      async function (request, reply) {
        try {
          const { otp } = request.body
          const otpModel = new OTP()
          const userModel = new User()

          // Check otp details
          const otpData = await otpModel.getOtpDetails(otp.toString())

          if (!otpData) {
            return reply.error({ message: 'Invalid OTP' })
          }

          const updated = await userModel.verifyUser(otpData.user)
          if (updated) {
            reply.success({
              message: 'Verification success.'
            })
          }
        } catch (err) {
          console.log(err)
          reply.error({ message: err.message })
        }
        return reply
      }
    ),
    // User login
    fastify.post(
      '/login',
      { schema: validationSchema.userLoginSchema },
      async function (request, reply) {
        try {
          const { userName, password } = request.body
          const userModel = new User()
          // Check user exists or not
          const user = await userModel.getUserByUserName(userName)
          if (!user) {
            return reply.error({ message: 'User not found' })
          }
          // Compare password
          if (!user.autheticate(password)) {
            return reply.error({ message: 'Invalid Password' })
          }
          // Check verified or not
          if (!user.isVerified) {
            return reply.error({ message: 'Please verify your email.' })
          } else {
            // Create JWT token
            const token = fastify.jwt.sign(
              { userName: user.userName, role: user.role },
              process.env.JWT_SECRET,
              { expiresIn: process.env.TOKEN_EXPIRESIN }
            )
            reply.success({ token })
          }
        } catch (err) {
          console.log(err)
          reply.error({ message: err.message })
        }
        return reply
      }
    ),
    // Get otp to reset password
    fastify.post(
      '/forgotPassword',
      { schema: validationSchema.userForgotPasswordSchema },
      async function (request, reply) {
        try {
          const { email } = request.body
          const userModel = new User()
          // Check user exists or not
          const user = await userModel.getUserByEmail(email)
          if (!user) {
            return reply.error({ message: 'User not found' })
          }

          // Generate and save otp
          const otp = generateOtp()
          const otpData = {
            otpNumber: otp,
            user: user._id
          }
          const otpModel = new OTP(otpData)
          const updated = await otpModel.save()
          if (updated) {
            reply.success({
              message: 'An OTP has been sent to your email.'
            })
            // Send forgot password email
            await sendForgotPasswordEmail(user, otp)
          }
        } catch (err) {
          console.log(err)
          reply.error({ message: err.message })
        }
        return reply
      }
    ),
    fastify.post(
      '/validateUser',
      { schema: validationSchema.validateUserSchema },
      async function (request, reply) {
        try {
          const { otp } = request.body
          const otpModel = new OTP()

          // Check otp details
          const otpData = await otpModel.getOtpDetails(otp.toString())

          if (!otpData) {
            return reply.error({ message: 'Invalid OTP' })
          }

          reply.success({
            message: 'User details.',
            data: otpData.user
          })
        } catch (err) {
          console.log(err)
          reply.error({ message: err.message })
        }
        return reply
      }
    ),
    fastify.post(
      '/resetPassword/:id',
      { schema: validationSchema.userResetPasswordSchema },
      async function (request, reply) {
        try {
          const { id } = request.params
          const { newPassword } = request.body
          const userModel = new User()
          const user = await userModel.getUserById(id)

          if(!user){
              return reply.error({ message: 'User not found' })
          }

          // New password
          user.password = newPassword
          const updated = user.save()

          if (!updated) {
            reply.error({ message: 'Something went wrong. Please try again' })
          } else {
            reply.success({
              message: 'Password updated successfully.'
            })
          }
        } catch (err) {
          console.log(err)
          reply.error({ message: err.message })
        }
        return reply
      }
    )
}

module.exports.autoPrefix = '/auth'
