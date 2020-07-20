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
        if (res.error)
          reject(res.error);

        const steps = res.body[0].steps.length;
        result = result + "There are " + steps + " steps: "+"\n";
        for(var i = 0; i < steps; i++){
          var z = i + 1;
          result = result + "Step " + z + "):\n" + res.body[0].steps[i].step + "\n" +"Equipment needed for this step: \n" ;
          for(var k = 0; k < res.body[0].steps[i].equipment.length; k++){
            result = result + res.body[0].steps[i].equipment[k].name + "\n";
          }
          result = result + "\n\nIngredients needed for this step: ";
          for(var j = 0; j < res.body[0].steps[i].ingredients.length; j++){
            result = result + res.body[0].steps[i].ingredients[j].name + "\n";
          }
          result = result + "\n\n";
        }
        resolve(result)
    });
  })
}


module.exports = {
  mealsByIngredient,
  mealsByIngredient_Stringify,
  mealsPlanning,
  mealsPlanning_Stringify,
  recipeById
}
