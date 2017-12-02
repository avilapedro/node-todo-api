const mongoose = require('mongoose')
const Schema = mongoose.Schema.bind(mongoose)
const model = mongoose.model.bind(mongoose)
const _ = require('lodash')

const { isEmail } = require('validator')
const jwt = require('jsonwebtoken')

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      isAsync: false,
      validator: isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  return _.pick(userObject, ['_id', 'email'])
}

UserSchema.methods.generateAuthToken = async function () {
  const user = this
  const access = 'auth'

  const data = {
    _id: user._id.toHexString(),
    access
  }
  const token = jwt.sign(data, 'abc123').toString()

  user.tokens.push({ access, token })

  await user.save()

  return token
}

const User = model('User', UserSchema)

module.exports = { User }