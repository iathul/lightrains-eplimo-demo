const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const otpSchema = new mongoose.Schema(
  {
    otpNumber: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 6
    },
    user: {
      type: ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)
otpSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300 }
)

otpSchema.methods = {
  getOtpDetails: async function (otp) {
    const otpModel = mongoose.model('OTP')
    const otpDetails = otpModel.findOne({ otpNumber: otp })
    return otpDetails
  }
}

module.exports = mongoose.model('OTP', otpSchema)
