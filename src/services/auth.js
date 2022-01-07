'use strict'

const User = require('../models/userModel.js')
const { 
  getUserName, 
  generateOtp,
  isOtpExpired
} = require('../utils/index')
const { 
  userRegistrationSchema, 
  userLoginSchema,
  userOtpVerificationSchema,
  userForgotPasswordSchema,
  userResetPasswordSchema
} = require('../schema/userSchema')
const { 
  sendVerificationEmail,
  sendForgotPasswordEmail
} = require('../utils/email')


module.exports = async function (fastify, opts) {
  // User registration
  fastify.post(
    '/register',
    { schema: userRegistrationSchema },
    async function(request, reply) {
      try {
        const { firstName, lastName, email, phoneNumber, password } = request.body

        // Create unique username
        const userName = getUserName(firstName, lastName)

        // Generate otp
        const otp = generateOtp();
       
        const userData = {
          firstName: firstName,
          lastName: lastName,
          userName: userName,
          email: email,
          phoneNumber: phoneNumber,
          password: password,
          otp: otp,
          otpCreatedAt: Date.now()
        }
        const userModel = new User(userData)
        // Check user exists or not 
        const user = await userModel.getUserByEmail(email)
        if(user){
          return reply.error({ message: 'User already exists'})
        }
        // Create new user
        const newUser = await userModel.save()
        if(!newUser){
          reply.error({ message: 'Registration failed. Please try again'})
        }else {
          reply.success({
            message: 'Registration success.',
          })
          // Send verification email
          await sendVerificationEmail(newUser, otp)
        }
      } catch (err) {
        console.log(err)
        reply.error({ message: err.message })
      }
      return  reply
    }
  ),
  // Verify otp
  fastify.post(
    '/verify',
    { schema: userOtpVerificationSchema },
    async function(request, reply) {
      try {
        const { otp } = request.body
        const userModel = new User()

        // Check user exists or not 
        const user = await userModel.getUserByOtp(otp)

        if(!user){
          return reply.error({ message: 'Invalid OTP'})
        }

        // Check otp expired is not
        const isExpired = isOtpExpired(user.otpCreatedAt)
        if(isExpired) {
          return reply.error({ message: 'OTP expired'})
        }

        const updated = await userModel.verifyUser(otp)
        if(updated){
          reply.success({
            message: 'Verification success.',
          })
        }
      } catch (err) {
        console.log(err)
        reply.error({ message: err.message })
      }
      return  reply
    }
  ),
  // User login
  fastify.post(
    '/login',
    { schema: userLoginSchema },
    async function(request, reply) {
      try {
        const { userName, password } = request.body
        const userModel = new User()
        // Check user exists or not 
        const user = await userModel.getUserByUserName(userName)
        if(!user){
          return reply.error({ message: 'User not found'})
        }
        // Compare password
        if (!user.autheticate(password)) {
          return reply.error({ message: 'Invalid Password'})
        }
        else {
          // Create JWT token
          const token = fastify.jwt.sign(
            { userName: user.userName  }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.TOKEN_EXPIRESIN }
        )
          reply.success({ token }) 
        }
      } catch (err) {
        console.log(err)
        reply.error({ message: err.message })
      }
      return  reply
    }
  ),
  // Get otp to reset password
  fastify.post(
    '/forgotPassword',
    { schema: userForgotPasswordSchema },
    async function(request, reply) {
      try {
        const { email } = request.body
        const userModel = new User()
        // Check user exists or not 
        const user = await userModel.getUserByEmail(email)
        if(!user){
          return reply.error({ message: 'User not found'})
        }
        // Generate otp
        const otp = generateOtp();
        user.otp = otp
        user.otpCreatedAt = Date.now()
        const updated = user.save()
        if(updated){
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
      return  reply
    }
  ),
  fastify.post(
    '/resetPassword',
    { schema: userResetPasswordSchema },
    async function(request, reply) {
      try {
        const { otp, newPassword } = request.body
        console.log(otp.toString())
  
        const userModel = new User()
        const user = await userModel.getUserByOtp(otp.toString())

        if(!user){ 
          return reply.error({ message: "Invalid OTP" })
        }

        // Check otp expired is not
        const isExpired = isOtpExpired(user.otpCreatedAt)
        if(isExpired) {
          return reply.error({ message: 'OTP expired'})
        }

        // New password
        user.password = newPassword
        user.otp = null
        user.otpCreatedAt = null
        const updated = user.save()

        if(!updated){
          reply.error({ message: "Something went wrong. Please try again" })
        }else {
          reply.success({
            message: 'Password updated successfully.',
          })
        }
      } catch (error) {
        console.log(error)
        reply.error({ message: err.message })
      }
      return reply
    }
  )
}

module.exports.autoPrefix = '/auth'
