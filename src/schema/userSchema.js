const S = require('fluent-json-schema')

const registrationSchema = S.object()
  .prop('firstName', S.string().required())
  .prop('lastName', S.string().required())
  .prop('role', S.string().required())
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())
  .prop('password', S.string().minLength(8).required())
  .prop('phoneNumber', S.string().minLength(10).maxLength(20).pattern('^[0-9-+]{9,20}$').required())

exports.userRegistrationSchema = {
  tags: ['User'],
  summary: 'User registration',
  body: registrationSchema
}

const loginSchema = S.object()
  .prop('userName', S.string().required())
  .prop('password', S.string().minLength(8).required())

exports.userLoginSchema = {
  tags: ['User'],
  summary: 'User login',
  body: loginSchema
}

const otpVerificationSchema = S.object()
  .prop('otp', S.string().required())

exports.userOtpVerificationSchema = {
  tags: ['User'],
  summary: 'User otp verification',
  body: otpVerificationSchema
}

const changePasswordSchema = S.object()
  .prop('newPassword', S.string().minLength(8).required())

exports.userChangePasswordSchema = {
  tags: ['User'],
  summary: 'Update password',
  body: changePasswordSchema
}

const forgotPasswordSchema = S.object()
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())

exports.userForgotPasswordSchema = {
  tags: ['User'],
  summary: 'Get otp to update password',
  body: forgotPasswordSchema
}

const validateUser = S.object().prop('otp', S.string().required())

exports.validateUserSchema = {
  tags: ['User'],
  summary: 'Validate user to update password',
  body: validateUser
}

const resetPasswordSchema = S.object()
  .prop('newPassword', S.string().minLength(8).required())

const resetPswdParams = S.object()
  .prop('id', S.string().maxLength(24).required())

exports.userResetPasswordSchema = {
  tags: ['User'],
  summary: 'Reset password',
  body: resetPasswordSchema,
  params: resetPswdParams
}

