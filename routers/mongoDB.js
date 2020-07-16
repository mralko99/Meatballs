const mongoose = require('mongoose')

const dotenv = require("dotenv").config()

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  mealsId: [String],
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

var ingredientSchema = new Schema({
  ingredient: {
    type: String,
    required: true
  },
  ingredientId: {
    type: String,
    required: true
  },
})

var mealSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  recipe: String
})

var User = mongoose.model('User', userSchema);
var Ingredient = mongoose.model('Ingredient', ingredientSchema);
var Meal = mongoose.model('Meal', mealSchema);

/* Create a user instance in the users collection. */
function createUser (username, password) {
  var userInstance = new User ({
    username: username,
    password: password
  })

  userInstance.save(function(err, res) {
    if (err) throw err
  })
}

/* Find a User in the collection, returns the password. */
function findUser (username) {
  return new Promise(function(resolve, reject) {
    User.findOne({ username: username }, { username: 1, password: 1 },
      function (err, res) {
        if (err)  reject(err)
        else if (res == null) resolve("")
        else resolve(res.password)
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
        if (err) reject(err)
        else resolve(res)
    })
  })
}

function updateCalendarId (username, id) {
  const update = { calendarId: id }

  return new Promise(function(resolve, reject) {
    User.findOneAndUpdate({ username: username }, update, function (err, res) {
        if (err) reject(err)
        else resolve(res)
    })
  })
}

function getCalendarInfo(username) {
  return new Promise(function(resolve, reject) {
    User.findOne({ username: username }, { username: 1, calendarToken: 1, calendarTimeStamp:1, calendarAccessCode:1, calendarId: 1 },
      function (err, res) {
        if (err)  reject(err)
        else resolve(res)
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
        if (err)  reject(err)
        else resolve(res)
    })
  })
}

function getTwitterInfo(username) {
  return new Promise(function(resolve, reject) {
    User.findOne({ username: username }, { username: 1, twitterToken: 1, twitterSecret:1 },
       function (err, res) {
        if (err)  reject(err)
        else  resolve(res);
    })
  })
}

/* Associate a meal to a user.
  You can't make the association if the meal is not in the meals collection
  or if the meal has been already associated to the user. */
function associateMeal(username, id){
  existMeal(id).then(
    function(res) {
      if(res) {
        lookForMeal(username, id).then(
          function(res){
          if(!res) {
            var update = {$push: {mealsId: id}}
            return new Promise(function(resolve, reject) {
              User.findOneAndUpdate({ username: username }, update, function (err, res) {
                if (err) reject(err)
                else resolve(res)
              })
            })
          } else console.log("DATABASE WARNING the meal you are trying to associate is already associated for this user.")
        },
        function(err){ console.log("promises error in the mongo user: " + err) }
      )
      } else console.log("DATABASE WARNING the meal you are trying to associate doesn't exist in the meal collection.")
    },
    function(err){ console.log("promises error in the mongo user: " + err) }
  )
}

/* Given the id of a meal, returns true if
   the meal is already associated with the user. */
function lookForMeal(username, id){
  return new Promise(function(resolve, reject) {
    User.findOne({ username: username }, { mealsId: 1 }, function (err, res) {
      if (err) reject(err)
      else {
        for(i = 0; i < res.mealsId.length; i++)
          if(id == res.mealsId[i]) resolve(true)
        resolve(false)
      }
    })
  })
}

/* Validation of the ingredient for the chatbot. */
function checkIngredients(ingredient) {
  return new Promise(function(resolve, reject) {
    Ingredient.findOne({ ingredient: ingredient }, { ingredient: 1 },
       function (err, res) {
        if (err)  reject(err)
        else  resolve(res);
    })
  })
}

/* If meal is not in the collection, it'll be created with the recipe.
   If meal is already in the collection, the recipe will be updated. */
function createMeal(id, name, recipe) {
  var mealInstance = new Meal ({
    id: id,
    name: name,
    recipe: recipe
  })
  return new Promise(function(resolve, reject) {
    var query = Meal.findOne({ id: id }, function (err, res) {
      if (err) reject(err)
      else if (!query) updateRecipe(id, name, recipe) //se vero, c'è una corrispondenza
      else mealInstance.save(function(err, res) {
        if (err) throw err
        resolve(res)
      })
    })
  })
}

function updateRecipe(id, recipe) {
  const update = { recipe: recipe }
  return new Promise(function(resolve, reject) {
    Meal.updateOne({ id: id }, update, function (err, res) {
      if (err) reject(err)
      else resolve(res)
    })

  })
}

/* Check if the meal is in the collection */
function existMeal(id) {
  return new Promise(function(resolve, reject) {
    Meal.exists({ id: id }, function (err, res) {
      if (err) reject(err)
      else if (res) resolve(true)
      else resolve (false)
    })
  })
}

/* Return a meal given the id */
function getMealById(id){
  return new Promise(function(resolve, reject) {
    Meal.findOne({ id: id }, function(err, res) {
      if (err) reject(err)
      else if (res == null) resolve(null)
      else resolve(res)
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
  getTwitterInfo,
  associateMeal,
  lookForMeal,
  checkIngredients,
  createMeal,
  updateRecipe,
  existMeal,
  getMealById
}
