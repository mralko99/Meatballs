const express = require('express'); //returns a function
const app = express(); //returns an object of type Express
var unirest = require("unirest");

app.use(express.json()); //(per il req.body.name)

const dotenv = require("dotenv").config()

var ritorno = "";


function mealsByIngredient(clientIngredients){//search recipes by ingredients,
																				//clientIngredients è una stringa nel formato ingrediente%2cingrediente%2cingrediente...
																				//e.g. clientIngredients  = "apples%2Cflour%2Csugar";

	return new Promise (function (resolve, reject){


			var missingIngredientsNumber = 0;
			var req = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients");

			req.query({
				"number": "3",
				"ranking": "1",
				"ignorePantry": "false",
				"ingredients": clientIngredients
			});
			console.log(clientIngredients)
			req.headers({
				"x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
				"x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
				"useQueryString": true
			});


			req.end(function (res) {
				if (res.error) reject(res.error);
				//console.log("risultato seee "+res.body);
				resolve(res);
				console.log(ritorno);

				/*
				for (var k = 0; k < 3; k++){
					var n = k + 1;
					missingIngredientsNumber = res.body[k].missedIngredientCount;
					console.log("Option " + n +") is: " + res.body[k].title + "\nId is: " + res.body[k].id +  "\nHere are the " + missingIngredientsNumber + " missing ingredients: ");
					for (var i = 0; i < missingIngredientsNumber; i++){
						console.log(res.body[k].missedIngredients[i].name );
					}
					console.log("\n");

				}
				console.log("Choose one option, type 1, 2 or 3");
				*/

			});

	//console.log(ritorno);
	})

}

var ingr = "apples%2Cflour%2Csugar";
//var r1 = mealsByIngredient(ingr); //r1 è un json contenente un array di json che rappresentano le 3 opzioni (i 3 pasti)





function recipeById(Id){
	return new Promise (function (resolve,reject) {


					var forRapid =  "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/" + Id + "/analyzedInstructions"
					//var req = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/163949/analyzedInstructions");
					var req = unirest("GET", forRapid);

					req.query({
						"stepBreakdown": "false"
					});

					req.headers({
						"x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
						"x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
						"useQueryString": true
					});

					result = ""

					req.end(function (res) {
						if (res.error) reject(res.error);

						const steps = res.body[0].steps.length;
						result = result + "There are " + steps + " steps: "+"\n";
						for(var i = 0; i < steps; i++){
							var z = i + 1;
							result = result + "Step " + z + "):\n" + res.body[0].steps[i].step + "\n" +
							 		"Equipment needed for this step: \n" ;
									for(var k = 0; k < res.body[0].steps[i].equipment.length; k++){
										result = result + res.body[0].steps[i].equipment[k].name + "\n";
									}
									result = result + "\n\nIngredients needed for this step: ";
												for(var j = 0; j < res.body[0].steps[i].ingredients.length; j++){
													result = result + res.body[0].steps[i].ingredients[j].name + "\n";
												}
												result = result + "\n\n";
						}//[0].steps[0].step
						resolve(result)

					});
	})
}









function mealsByCalories(calories, diet, exclude){
																				//calories è un intero (Rappresenta il numero di calorie che l'utente vuole consumare durante il giorno) e.g. 2500
																				//diet vale "" oppure "vegetarian"
																				//exclude è una stringa nel formato ingrediente%2Cingrediente%2Cingrediente...
																				//e.g. eclude  = "apples%2Cflour%2Csugar", oppure exclude = "";


	return new Promise (function (resolve, reject){


			var missingIngredientsNumber = 0;
			var req = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/mealplans/generate");

			req.query({
				"timeFrame": "day",
				"targetCalories": calories,
				"diet": diet,       //"vegetarian", si può implementare come parametro della query dell'utente che si connette
				"exclude": exclude     //"shellfish%2Colives", si può implementare come parametro della query dell'utente che si connette
			});


			req.headers({
				"x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
				"x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
				"useQueryString": true
			});


			req.end(function (res) {
				if (res.error) reject(res.error);
				//console.log("risultato seee "+res.body);
				resolve(res);
				//console.log(ritorno);

				console.log("\n\n\nHere are your meals, enjoy ;) \n");
				console.log("1) Breakfast: " + res.body.meals[0].title + "\nThe Id of your breakfast is: " + res.body.meals[0].id + "\nThe preparation takes " + res.body.meals[0].readyInMinutes + " minutes\n");
				console.log("2) Lunch: " + res.body.meals[1].title + "\nThe Id of your breakfast is: " + res.body.meals[1].id + "\nThe preparation takes " + res.body.meals[1].readyInMinutes + " minutes\n");
				console.log("3) Dinner: " + res.body.meals[2].title + "\nThe Id of your breakfast is: " + res.body.meals[2].id + "\nThe preparation takes " + res.body.meals[2].readyInMinutes + " minutes\n");
				console.log("The total nutrional values of the meals are: \n" + "Calories = " + res.body.nutrients.calories + "\nProteins =  " + res.body.nutrients.protein +  "\nFat =  " + res.body.nutrients.fat + "\nCarbohydrates=  " + res.body.nutrients.carbohydrates);

			});

	//console.log(ritorno);
	})

}
//mealsByCalories(2500, "vegetarian", "olives%2Cshellfish");





//get string version of meals
function mealsByIngredient_Stringify (api_meals){//ex get_meals_string
  console.log(api_meals.body)
  result = ""
  for (var k = 0; k < 3; k++){
    var n = k + 1;
    missingIngredientsNumber = api_meals.body[k].missedIngredientCount;
    result = result + "Option " + n +") is: " + api_meals.body[k].title + "\nId is: " + api_meals.body[k].id +  "\nHere are the " + missingIngredientsNumber + " missing ingredients: ";
    for (var i = 0; i < missingIngredientsNumber; i++){
      result = result + "\n" + api_meals.body[k].missedIngredients[i].name ;
    }
    result = result + "\n\n"
  }
  return result;
}









module.exports = {
	ritorno,
	mealsByIngredient,
	mealsByIngredient_Stringify,
	mealsByCalories,
	recipeById
}
