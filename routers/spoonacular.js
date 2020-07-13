const express = require('express'); //returns a function
const app = express(); //returns an object of type Express
var unirest = require("unirest");

app.use(express.json()); //(per il req.body.name)


var ritorno = "";


function myfunction1(){//search recipes by ingredients


	var missingIngredientsNumber = 0;
	var req = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients");


	req.query({
		"number": "3",
		"ranking": "1",
		"ignorePantry": "false",
		"ingredients": "apples%2Cflour%2Csugar"
	});

	req.headers({
		"x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
		"x-rapidapi-key": "8b7bf76a17mshbf959543e115761p120952jsn499463a234ee",
		"useQueryString": true
	});


	req.end(function (res) {
		if (res.error) throw new Error(res.error);

		ritorno = res.body;
		console.log(ritorno);
	});

	//console.log(ritorno);


}

module.exports = {
	ritorno,
	myfunction1
}

//myfunction1();

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
