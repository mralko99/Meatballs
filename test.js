req = require('request')
localurl = "http://localhost:5000"

// API 1
function test1(productType, maxCalories, exclude, include) {
  url = localurl + "/apimeatballs/getrecipe/" + productType

  body = {
    sub_name = productType
    max_calories = maxCalories
    excluded_ingredients = exclude
    included_ingredients = include
  }

  return new Promise(function(resolve, reject) {
    req.get({ url: url, body: body, "json": true },
      function(error, response, body) {
        if(error) reject(error)
        else resolve(body)
    })
}

// API 2
function test2(ingredient) {
  url = localurl + "/apimeatballs/nutritionalvalues/"

  body = {
    ingredient = ingredient
  }

  return new Promise(function(resolve, reject) {
    req.get({ url: url, body: body, "json": true },
      function(error, response, body) {
        if(error) reject(error)
        else resolve(body)
    })
}

// API 3
function test3(productType, maxCalories, maxFat) {
  url = localurl + "/apimeatballs/shoppinglist/" + productType

  body = {
    product_type = productType
    max_calories = maxCalories
    max_fat = maxFat
  }

  return new Promise(function(resolve, reject) {
    req.get({ url: url, body: body, "json": true },
      function(error, response, body) {
        if(error) reject(error)
        else resolve(body)
    })
}


test1("pasta", 1000, ["tomato", "fish"], ["olives"]).then(
  function(res) {
    console.log(res)
  },
  function(err) {
    console.log("Error in test1: " + err)
  }
)

test2("tomato").then(
  function(res) {
    console.log(res)
  },
  function(err) {
    console.log("Error in test2: " + err)
  }
)

test3("pasta", 1000, 20).then(
  function(res) {
    console.log(res)
  },
  function(err) {
    console.log("Error in test3: " + err)
  }
)
