'use strict'

const User = require('../models/userModel.js')
const validationSchema = require('../schema/userSchema')

module.exports = async function(fastify, opts) {

  // Verify Jwt token
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.error({ message: err.message })
    }
  })

  // Change password
  fastify.post(
    '/changePassword',
    { schema: validationSchema.userChangePasswordSchema },
    async function (request, reply) {
      try {
        const { userName } = request.user
        const { newPassword } = request.body
        const userModel = new User()
        const user = await userModel.getUserByUserName(userName)

        if (!user) {
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
      } catch (error) {
        console.log(error)
        reply.error({ message: err.message })
      }
      return reply
    }
  ),
    fastify.post(
      '/updateProfile',
      {
        schema: validationSchema.userprofileValidationSchema
      },
      async function (request, reply) {
        try {
          const { userName } = request.user
          const { profile } = request.body

          const userModel = new User()
          const user = await userModel.getUserByUserName(userName)

          if (!user) {
            return reply.error({ message: 'User not found' })
          }
          // Update profile
          user.profile = profile
          const updated = user.save()

          if (!updated) {
            reply.error({ message: 'Something went wrong. Please try again' })
          } else {
            reply.success({
              message: 'Profile updated successfully.'
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
module.exports.autoPrefix = '/users'
