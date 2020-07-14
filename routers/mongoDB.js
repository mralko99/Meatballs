const mongoose = require('mongoose')
const dotenv = require("dotenv").config()

//connecting to the database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var Schema = mongoose.Schema;

//Schema for a user
var userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  //Google Calendar fields
  calendarToken: String,
  calendarTimeStamp: Date,
  calendarId: String,
  calendarAccessCode: String,
  //Twitter fields
  twitterToken: String,
  twitterTimeStamp: Date,
  twitterSecret: String
})

var User = mongoose.model('User', userSchema);

//Create a user instance in the users collection
function createUser (username, password) {
  var userInstance = new User ({
    username: username,
    password: password
  })

  userInstance.save(function(err, res) {
    if (err) throw err
  })
}
//Find a User in the collection, returns the password.
function findUser (username) {
  return new Promise(function(resolve, reject) {
    User.findOne({ username: username }, { projection: { username: 1, password: 1 } },
      function (err, res) {
        if (err)
          reject(err)
        else if (res == null)
          resolve("")
        else
          resolve(res.password)
    })
  })
}

function updateCalendarToken (username, token, timeStamp, accessCode) {
  const update = {
    calendarToken: token,
    calendarTimeStamp: timeStamp,
    calendarAccessCode: accessCode
  }

  return new Promise(function(resolve, reject) {
    User.findOneAndUpdate({ username: username }, update, function (err, res) {
        if (err)
          reject(err)
        else
          resolve(res)
    })
  })
}

function updateCalendarId (username, id) {
  const update = { calendarId: id }

  return new Promise(function(resolve, reject) {
    User.findOneAndUpdate({ username: username }, update, function (err, res) {
        if (err)
          reject(err)
        else
          resolve(res)
    })
  })
}

function getCalendarInfo(username) {
  return new Promise(function(resolve, reject) {
    User.findOne({ username: username }, { projection: { username: 1, calendarToken: 1, calendarTimeStamp:1, calendarAccessCode:1, calendarId: 1 } },
      function (err, res) {
        if (err)
          reject(err)
        else
          resolve(res)
    })
  })
}

function updateTwitterToken (username, token, secret) {
  const update = {
    twitterToken: token,
    twitterSecret: secret
  }

  return new Promise(function(resolve, reject) {
    User.findOneAndUpdate({ username: username }, update, function (err, res) {
        if (err)
          reject(err)
        else
          resolve(res)
    })
  })
}

function getTwitterInfo(username) {
  return new Promise(function(resolve, reject) {
    User.findOne({ username: username }, { projection: { username: 1, twitterToken: 1, twitterSecret:1 },
       function (err, res) {
        if (err)
          reject(err)
        else
          resolve(res)
    })
  })
}

module.exports = {
  createUser,
  findUser,
  getCalendarInfo,
  updateCalendarToken,
  updateCalendarId,
  updateTwitterToken,
  getTwitterInfo
}
