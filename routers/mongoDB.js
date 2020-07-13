const mongoose = require('mongoose');
const dotenv = require("dotenv").config();

password = ""

//connecting to the database
const URI = process.env.MONGODB_URI;
mongoose.connect(URI, { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var Schema = mongoose.Schema;

//Schema for a user
var userSchema = new Schema({
  username: String,
  password: String
})

var User = mongoose.model('User', userSchema);

//Method to save a user instance in the users collection.
function createUser(username, password){
  var userInstance = new User({
    username: username,
    password: password
  })

  userInstace.save(function(err) {
    if (err) throw err;
  })
}

//Method to find a user in the collection give the username.
//Returns "" if the username is not in the collection, otherwise it returns the password associated.
function findUser(username) {
  User.findOne({ username: username }, { username: 1, password: 1 }, function(err, res) {
    if (err) throw err;
    else if (res === null) {
      return
    }
    else password = User.password;
  })
}

/*
function insertMeals(result){
  const db = client.db(process.env.DB_NAME);
  db.collection('meals').insertOne(result.body, function(err, res) {
    if(err) throw err;
    console.log("Successfully inserted the meals into the database!");
  });
};

function retrieveIdMeal(req, meals){
  const db = client.db(process.env.DB_NAME);
  var object = db.collection('meals').find().limit(1).sort({$natural:-1});
  if(req == "colazione"){
    object.find( {meals:0} );
  }
}

module.exports.insertMeals = insertMeals;
module.exports.retrieveIdMeal = retrieveIdMeal;
*/
module.exports = {
  createUser,
  findUser,
  password
}
