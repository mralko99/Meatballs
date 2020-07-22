var unirest = require("unirest");

dotenv = require("dotenv").config();

var ritorno = "";

/*search recipes by ingredients,
clientIngredients è una stringa nel formato ingrediente%2cingrediente%2cingrediente...
e.g. clientIngredients  = "apples%2Cflour%2Csugar";*/
function mealsByIngredient(clientIngredients){

  return new Promise (function (resolve, reject){
    var missingIngredientsNumber = 0;
    var req = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients");

    req.query({
      "number": "3",
      "ranking": "1",
      "ignorePantry": "false",
      "ingredients": clientIngredients
    });

    req.headers({
      "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "useQueryString": true
    });

    req.end(function (res) {
      if (res.error)
        reject(res.error);
      else
        resolve(res.body);
    });
  });

}


//get string version of meals
function mealsByIngredient_Stringify (api_meals){
  result = "";
  for (var k = 0; k < 3; k++){
    var n = k + 1;
    missingIngredientsNumber = api_meals[k].missedIngredientCount;
    result = result + "Option " + n +") is: " + api_meals[k].title + "\nId is: " + api_meals[k].id +  "\nHere are the " + missingIngredientsNumber + " missing ingredients: ";
    for (var i = 0; i < missingIngredientsNumber; i++){
      result = result + "\n" + api_meals[k].missedIngredients[i].name ;
    }
    result = result + "\n\n";
  }
  return result;
}


/*
esempio di chiamata: dailyMealsByCalories(2500, "", "apples%2Cflour%2Csugar").
calories è un intero (Rappresenta il numero di calorie che l'utente vuole consumare durante il giorno) e.g. 2500
diet vale "" oppure "vegetarian"
exclude è una stringa nel formato ingrediente%2Cingrediente%2Cingrediente...
e.g. exclude  = "apples%2Cflour%2Csugar", oppure exclude = "";
*/


function mealsPlanning(calories, diet, exclude){
  return new Promise (function (resolve, reject){
    var req = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/mealplans/generate");

    req.query({
      "timeFrame": "day",
      "targetCalories": calories,
      "diet": diet,       //"vegetarian", si può implementare come parametro della query dell'utente che si connette
      "exclude": exclude//"shellfish%2Colives", si può implementare come parametro della query dell'utente che si connette
    });


    req.headers({
      "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "useQueryString": true
    });


    req.end(function (res) {
      if (res.error)
        reject(res.error);

      var final = {};

      var breakfast = {
        "title":res.body.meals[0].title,
        "id":res.body.meals[0].id
      };

      var lunch = {
        "title":res.body.meals[1].title,
        "id":res.body.meals[1].id
      };

      var dinner = {
        "title":res.body.meals[2].title,
        "id":res.body.meals[2].id
      };

      final.breakfast = breakfast;
      final.lunch = lunch;
      final.dinner = dinner;

      resolve(final);
    });
  });
}


//get string representation of meals planning
function mealsPlanning_Stringify (planned_meals){
  result = "Here is your daily plan !!! \n";
  for(elem in planned_meals){
    result = result + "\n" + elem + " : "+planned_meals[elem].title;
  }
  result = result + "\n";
  return result;
}


function recipeById(Id){

  return new Promise (function (resolve,reject) {
    var forRapid =  "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/" + Id + "/analyzedInstructions";
    console.log("forRapid\n" +  forRapid);
    var req = unirest("GET", forRapid);

    req.query({
      "stepBreakdown": "false"
    });

    req.headers({
      "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "useQueryString": true
    });

    result = "";

    req.end(
      function (res){
        if (res.error)reject(res.error);
        if (res.body == ""){
          resolve("There is no recipe for this meal")
        }
        else{
          console.log("okissimo\n" + JSON.stringify(res) + "finse\n\n")
          const steps = res.body[0].steps.length;
          result = result + "There are " + steps + " steps: "+"\n";
          for(var i = 0; i < steps; i++){
            var z = i + 1;
            result = result + "Step " + z + "):\n" + res.body[0].steps[i].step + "\n\nEquipment needed for this step: \n" ;
            for(var k = 0; k < res.body[0].steps[i].equipment.length; k++){
              result = result + res.body[0].steps[i].equipment[k].name + "\n";
            }
            result = result + "\nIngredients needed for this step: ";
            for(var j = 0; j < res.body[0].steps[i].ingredients.length; j++){
              result = result + res.body[0].steps[i].ingredients[j].name + "\n";
            }
            result = result + "\n\n";
          }
          resolve(result)
        }
    });
  })
}


/*
returns JSON = {
            "id": [Int],
            "title": [String],
            "calories": [Int],
            "protein": [Int],
            "fat": [Int],
            "carb": [Int]
}
*/
function getMealComplex(sub_name, max_calories, excluded_ingredients, included_ingredients){
  return new Promise (function(resolve,reject){
    var url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/searchComplex"
    var req = unirest("GET", url);
    req.headers({
      "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "useQueryString": true
    });
    excluded_ingredients_joined = excluded_ingredients.join("%2C ")
    included_ingredients_joined = included_ingredients.join("%2C ")
    req.query({
    	"query": sub_name,
    	"includeIngredients": included_ingredients_joined,
    	"excludeIngredients": excluded_ingredients_joined,
    	"maxCalories": max_calories,
    	"number": "1"
    });
    console.log(JSON.stringify(req))
    req.end(
      function(res){
          console.log(JSON.stringify(res.body))
        	if (res.error) reject(res.error);
          meal = res.body.results[0]
          delete meal.usedIngredientCount
          delete meal.likes
          delete meal.image
          delete meal.imageType
          resolve(meal)
      }
    )
  })
}


/*
returns Array of JSON = [
          {
            "id": [Int],
            "title": [String]
          },{
            ....
          }
        ]
*/
function getGroceryProducts(product_type,max_calories,max_fat){
  return new Promise (function(resolve,reject){
    var url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/products/search"
    var req = unirest("GET", url);
    req.headers({
      "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "useQueryString": true
    });
    req.query({
      "query": product_type,
      "maxCalories": max_calories,
      "maxFat": max_fat,
      "number": "10"
    });
    /*
    console.log("query= "+JSON.stringify(req))
    console.log("product_type= "+product_type)
    console.log("max_calories= "+max_calories)
    console.log("max_fat= "+max_fat)
    console.log(JSON.stringify(req))
    */
    req.end(
      function(res){
        if (res.error) reject(res.error);
        console.log(JSON.stringify(res))
        products = res.body.products
        for(index in products){
          // delete products[index].image
          // delete products[index].imageType
          delete products[index].id
        }
        console.log(products)
        resolve(products)
      }
    )
  })
}

function getNutritionalsById(product_id){
  return new Promise (function(resolve,reject){
    var url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/products/"+product_id+"/nutritionWidget"
    var req = unirest("GET", url);
    req.headers({
      "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "useQueryString": true
    });
    //console.log(JSON.stringify(req))
    req.end(
      function(res){
        if (res.error) reject(res.error);
        console.log("output da spoonacular= "+JSON.stringify(res.body))
        resolve(res.body)
        //console.log(JSON.stringify(res.body))
      }
    )
  })
}

module.exports = {
  mealsByIngredient,
  mealsByIngredient_Stringify,
  mealsPlanning,
  mealsPlanning_Stringify,
  recipeById,
  getMealComplex,
  getGroceryProducts,
  getNutritionalsById
}
