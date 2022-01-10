'use strict'
// External Dependancies
const mongoose = require('mongoose')
const { Mixed } = mongoose.Schema.Types
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    profile: {
      type: Mixed
    },
    otp:{
      type: Number,
      unique: true,
      index: {
        unique: true,
        partialFilterExpression: {otp: {$type: "number"}}
      },
    },
    otpCreatedAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    hashedPswd: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

UserSchema.virtual('password')
  .set(function(password) {
    this._password = password
    this.hashedPswd = this.securePassword(password)
  })
  .get(function() { 
    return this._password
})

UserSchema.methods = {
  getUserById: async function (id) {
    const User = mongoose.model('User')
    let query = { _id: id }
    const options = {
      criteria: query
    }
    return User.load(options)
  },
  getUserByEmail: async function (email) {
    const userModel = mongoose.model('User')
    const User = userModel.findOne({email: email})
    return User
  },
  getUserByUserName: async function (userName) {
    const userModel = mongoose.model('User')
    const User = userModel.findOne({userName: userName})
    return User
  },
  getUserByOtp: async function (otp) {
    const userModel = mongoose.model('User')
    const User = userModel.findOne({otp: otp})
    return User
  },
  verifyUser: async function (otp) {
    const userModel = mongoose.model('User')
    const verified = await userModel.findOneAndUpdate(
      { otp: otp },
      { isVerified: true, otp: null, otpCreatedAt: null },
      { new: true }
    )
    return verified
  },

  // Compare password
  autheticate: function(plainpassword) {
    return  bcrypt.compareSync(plainpassword, this.hashedPswd)
  },

  // Create hashed password
  securePassword: function(plainpassword){
    if(!plainpassword) return "" 
      try {
        const hash = bcrypt.hashSync(plainpassword, 10)
        return hash
      } catch (error) {
        return ""
    }
  }
}

UserSchema.statics = {
  load: function (options, cb) {
    options.select = options.select || 'email name'
    return this.findOne(options.criteria).select(options.select).exec(cb)
  },

  list: function (options) {
    const criteria = options.criteria || {}
    const page = options.page - 1
    const limit = parseInt(options.limit) || 12
    const select = options.select || 'email name createdAt -__v'
    return this.find(criteria)
      .select(select)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .lean()
      .exec()
  }
}

module.exports = mongoose.model('User', UserSchema)
