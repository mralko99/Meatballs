const mongoose = require('mongoose')
const dotenv = require("dotenv").config()

//connecting to the database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true , useUnifiedTopology : true})
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Method to save a user instance in the users collection.
function createUser(username, password){
  var User = { username: username, password: password }
  db.collection("user").insertOne(User, function(err, res) {
    if (err) throw err
  })
}

function findUser (username) {
  return new Promise(function(resolve, reject) {
    db.collection("user").findOne({ username: username }, { projection: { username: 1, password: 1 } }, function (err, res) {
        if (err)
          reject(err)
        else if (res == null)
          resolve("")
        else
          resolve(res.password)
    })
  })
}

module.exports = {
  createUser,
  findUser
}
