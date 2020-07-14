const express = require('express'); //returns a function
const app = express(); //returns an object of type Express

var db = require('./routers/mongoDB');

app.use(express.json()); //(per il req.body.name)

// PORT (ENVIROMENT VARIABLE)  //a variable that is part of the enviroment in which teh process runs, its value is set outside this application
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
//scrivendo su terminale "$env:PORT = 5000" la macchina si metterà ad ascoltare sulla porta 5000

app.get('/api/composition', (req, res) => {

  var unirest = require("unirest");
  var request = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/quickAnswer");
  console.log('ok1');
  console.log(req.query.id);
  console.log('ok2');
  var info = req.query.id;  // example of terminal request: curl localhost:5000/api/composition?id=protein%20pepperoni
	                          // => answer (on terminal): In 1 serving pepperoni, there are 6.35 g of Protein. This amount covers 13% of your daily needs of Protein.
  request.query({
    "q": info
  });

  request.headers({
		"x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
		"x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
    "useQueryString": true
  });

  request.end(function (result) {
  	if (result.error) throw new Error(result.error);
    res.send(result.body.answer);
  });
});




//Restituisce 3 pasti (per una giornata), date le calorie desiderate
app.get('/api/mealplans', (req, res) => {
	var unirest = require("unirest");
	var request = unirest("GET", "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/mealplans/generate");
	var calories = req.query.calories;  //example of terminal request: curl localhost:5000/api/mealplans?calories=4000

	request.query({
		"timeFrame": "day",
		"targetCalories": calories,
		"diet": "",       //"vegetarian", si può implementare come parametro della query dell'utente che si connette
		"exclude": ""     //"shellfish%2C olives", si può implementare come parametro della query dell'utente che si connette
	});

	request.headers({
		"x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
		"x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
		"useQueryString": true
	});

	request.end(function (result) {
		if (result.error) throw new Error(result.error);
		var meals = result.body.meals;  //qua occhio alle promises, res.send dovrebbe utilizzare la variabile meals
		//console.log(meals); ok, meals is a json var containing the array of all possible meals
		res.send("\n\n\nHere is your meal plan: \n" + "Breakfast:  " + result.body.meals[0].title + "\n" + "Lunch:  " + result.body.meals[1].title + "\n" + "Dinner:  " + result.body.meals[2].title + "\nHere are the nutrional values: \n" + "Calories = " + result.body.nutrients.calories + "\nProteins =  " + result.body.nutrients.protein +  "\nFat =  " + result.body.nutrients.fat + "\nCarbohydrates=  " + result.body.nutrients.carbohydrates       );
    db.insertDB(result, meals);
    //console.log(result.body);
	});
});
