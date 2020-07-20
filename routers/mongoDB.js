const mongoose = require('mongoose')
const dotenv = require("dotenv").config()
const spoonacular = require('./spoonacular.js')

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var Schema = mongoose.Schema;

/* Schemas definition */
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
  ingredientId: String
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

/* ----------------------------------- USER ------------------------------------------ */

/* Create a user instance in the users collection. */
function createUser(username, password) {
  var userInstance = new User ({
    username: username,
    password: password
  })

  userInstance.save(function(err, res) {
    if (err) throw err
  })
}

/* Given a username, returns all the meals associated to the user */
function getUserMeals(username) {
  return new Promise(function(resolve, reject) {
    User.findOne({ username: username }, { username: 1, mealsId: 1 },
      function (err, res) {
        if (err)  reject(err)
        else if (res != null) resolve(res.mealsId)
        else resolve(null)
    })
  })
}

/* Find a User in the collection, returns the password. */
function getUserPassword(username) {
  return new Promise(function(resolve, reject) {
    User.findOne({ username: username }, { username: 1, password: 1 },
      function (err, res) {
        if (err)  reject(err)
        else if (res == null) resolve("")
        else resolve(res.password)
    })
  })
}

function updateCalendarToken(username, token, timeStamp, accessCode) {
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

function updateCalendarId(username, id) {
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

function updateTwitterToken(username, token, secret) {
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

/* ----------------------------------- MEAL ------------------------------------------ */

/* Associate a meal to a user.
  You can't make the association if the meal has been already associated to the user.
  If the meal does not exists in the collection, it'll be created and then associated to the user.
  Name and recipe can be null, id can't.                                                         */
function associateMeal(username, id, name, recipe){
  return new Promise(function(resolve, reject) {
    existMeal(id).then(
      function(res) {
        var update = {$push: {mealsId: id}}

        //IF MEAL ESISTE NEL DATABASE
        if(res) {
          lookForMeal(username, id).then(
            function(res_2) {
              if(!res) {
                User.findOneAndUpdate({ username: username }, update, function (err_3, res_3) {
                  if (err_3)
                    reject(err_3)
                  else
                    resolve(res_3)
                })
              }
              else
                console.warn("DATABASE WARNING the meal you are trying to associate has been already associated for this user.")
                resolve("Already in the Database")
            },
            function(err_2){
              console.warn("associateMeal error in the mongoDB: " + err_2)
              reject(err_2)
            }
          )
        }

        //IF MEAL NON ESISTE NEL DATABASE
        else {
          createMeal(id, name, recipe).then(
            function(res_2) {
                User.findOneAndUpdate({ username: username }, update, function (err_3, res_3) {
                  if (err_3)
                    reject(err_3)
                  else
                    resolve(res_3)
                })
            },
            function(err_2){
              console.warn("associateMeal error in the mongoDB: " + err)
              reject(err_2)
            }
          )
        }
      },
      function(err){
        console.warn("associateMeal error in the mongoDB: " + err)
        reject(err)
      }
    )
  })
}


/* If meal is not in the collection, it'll be created with the recipe.
   If meal is already in the collection, the name and the recipe will be updated. */
function createMeal(id, name, recipe) {
  mealInstance = new Meal ({
    id: id,
    name: name,
    recipe: recipe
  })
  update = { name: name, recipe: recipe }
  options = { upsert: true, new: true }
  return new Promise(function(resolve, reject) {
    Meal.findOneAndUpdate({ id: id }, update, options, function (err, res) {
      if (err) reject(err)
      else if (!res) {
         mealInstance.save(function(err, res) {
           if (err) throw err
         })
       }
       resolve(res)
    })
  })
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
    Ingredient.exists({ ingredient: ingredient },
       function (err, res) {
        if (err)
          reject(err)
        else  resolve(res);
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

/* Update only the recipe, return the document updated. */
function updateRecipe(id, recipe) {
  update = { recipe: recipe }
  options = { new: true }
  return new Promise(function(resolve, reject) {
    Meal.findOneAndUpdate({ id: id }, update, options, function (err, res) {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

/* Return a meal given the id. If the meal doesn't have a recipe,
   the method will get it through spoonacular.recipeById */
function getMealById(id) {
  return new Promise(function(resolve, reject) {
    Meal.findOne({ id: id }, function(err, res) {
      if (err) reject(err)
      else if (res == null) {
        console.warn("DATABASE WARNING the meal you are trying to get is not in the collection.")
        resolve(null)
      }
      else if (res.recipe == null) {
        console.warn("DATABASE WARNING the meal you are trying to get didn't have the recipe.")
        console.warn("  The recipe will be get through a call to Spoonacular.")
        spoonacular.recipeById(id).then(
          function(recipe) { return updateRecipe(id, recipe) },
          function(error){ console.warn("getMealById error in the mongoDB: " + err) }
        ).then(
          function(result) { resolve(result) }
        )
      }
      else resolve(res)
    })
  })
}

/* Return all the meals given an array of id */
function getMealsByIds(id) {
  return new Promise(function(resolve, reject) {
    Meal.find({ id: id }, function (err, res) {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

/* Find all the ids meal of a user which have the word "key" into their name. */
async function selectRecipe(username, key) {
  result = new Array();
  return getMealsByIds(await getUserMeals(username)).then(
    function(res){
      for(i = 0, j = 0; i < res.length; i++){
        if(res[i].name.includes(key)) {
          result[j] = {
            "id":res[i].id,
            "name":res[i].name
          }
          j++
        }
      }
      return result
    }, function(err){ console.warn("selectRecipe error in the mongoDB: " + err); }
  )
}

module.exports = {
  createUser,
  getUserMeals,
  getUserPassword,
  getCalendarInfo,
  updateCalendarToken,
  updateCalendarId,
  updateTwitterToken,
  getTwitterInfo,
  associateMeal,
  lookForMeal,
  checkIngredients,
  updateRecipe,
  existMeal,
  getMealById,
  getMealsByIds,
  selectRecipe
}
