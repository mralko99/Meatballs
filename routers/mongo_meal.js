const mongoose = require('mongoose')
const dotenv = require("dotenv").config()

//connecting to the database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var Schema = mongoose.Schema;

//Schema for a user
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

var Meal = mongoose.model('Meal', mealSchema);

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
    var query = Meal.updateOne({ id: id }, update, function (err, res) {
      if (err) reject(err)
      else resolve(res)
    })

  })
}

/* Check if the meal is in the collection */
function exist(id) {
  return new Promise(function(resolve, reject) {
    var query = Meal.exists({ id: id }, function (err, res) {
      if (err) reject(err)
      else if (res) resolve(true)
      else resolve (false)
    })

  })
}

//IMPLEMENTARE getMealById

module.exports = {
  createMeal,
  updateRecipe,
  exist
}
