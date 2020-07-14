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





module.exports = {
	ritorno,
	mealsByIngredient,
	recipeById
}
