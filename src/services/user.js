'use strict'

const User = require('../models/userModel.js')
const { 
  userChangePasswordSchema,
} = require('../schema/userSchema')
const S = require('fluent-json-schema')


module.exports = async function(fastify, opts) {

  const profileValidationSchema = S.oneOf([
    S.object()
      .id('#doctor')
      .prop(
        'profile',
        S.object()
          .required()
          .prop('qualification', S.string().required())
          .prop('area_of_expertise', S.string().required())
      ),
    S.object()
      .id('#fitness-trainer')
      .prop(
        'profile',
        S.object()
          .required()
          .prop('total_training_experience', S.number().required())
      )
  ])

  const validationConstraint = {
    body: {
      constraint: function (request) {
        if (request.user.role === 'doctor') {
            return '#doctor'
        }
        if (request.user.role === 'fitness-trainer') {
            return '#fitness-trainer'
        }
      }
    }
  }

    fastify.register(require('fastify-schema-constraint'), validationConstraint)
  
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
      { schema: userChangePasswordSchema },
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
          schema: {
            body: profileValidationSchema
          }
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
