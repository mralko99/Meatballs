express = require("express");
enablews = require("express-ws");
dotenv = require("dotenv").config();
oauth = require('oauth');
session = require('express-session');
unirest = require("unirest");
swaggerUI= require('swagger-ui-express');
swaggerDocument= require('./swagger.json');

session.calendar = require("./routers/calendar");
session.twitter = require("./routers/twitter");
session.mongoDB = require("./routers/mongoDB");
session.spoonacular = require("./routers/spoonacular");

auth = require("./flow/auth");
chat_router = require("./flow/chat_router");
recipe_ingredients =require("./flow/recipe_ingredients");
recipe_calories =require("./flow/recipe_calories");
select_meal =require("./flow/select_meal");
view_recipe =require("./flow/view_recipe");
post_twitter =require("./flow/post_twitter");

app = express()
enablews(app)
app.use(express.json());

app.use('/meatballs-swaggerapi',swaggerUI.serve ,swaggerUI.setup(swaggerDocument));

app.ws("/chatbot", (ws,req)=> {

  ws.send('Insert username')

  session.main_status=0 // test
  session.sub_flow_status=0

  session.recipe_ID=""

  ws.on("message",msg =>{
    if (session.main_status>=1&&(msg == "help"||msg == "exit"||msg == "menu")){
      if(msg == "help"){
        ws.send("exit - quit from the chat")
        if (session.main_status!=1){
          ws.send("menu - go back to main menu")
        }
        if (session.main_status==1){
          ws.send("recipe ingredients - find a meal given some ingredients")
          ws.send("meal planner - find a daily diet and save it in the calendar")
          ws.send("select meal - select a meal from the ones associated to your user")
          ws.send("post twitter - post the name of the selected meal")
          ws.send("view recipe - view the recipe of the selected meal")
        }
      }

      //Close the chat
      else if(msg == "exit"){
        ws.send("You succefully disconnect from the session")
        ws.close()
      }

      //Redirect user to main menu
      else if(msg == "menu"){
        session.main_status = 1
        session.sub_flow_status = 0
        ws.send("You are now on the main menu")
      }
    }
    else{
      switch (session.main_status) {
        //Auth flow
        case 0:
          auth.auth(ws,msg,session)
          break;
        //Chat Router
        case 1:
          chat_router.chat_router(ws,msg,session)
          break;
        //Recipe ingredients
        case 2:
          recipe_ingredients.recipe_ingredients(ws,msg,session)
          break;
        //Meals planner
        case 3:
          recipe_calories.recipe_calories(ws,msg,session)
          break;
        //Select Meals
        case 4:
          select_meal.select_meal(ws,msg,session)
          break;
        //Post_Twitter
        case 5:
          post_twitter.post_twitter(ws,msg,session)
          break;
        default:
      }
    }
  })
})


app.get("/twitter/callback", (req,res)=> {
  session.twitter.consumer().getOAuthAccessToken(req.query.oauth_token, session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token "+error);
    } else {

      console.log("AccessToken Obtained")

      res.send("Congratulation "+results.screen_name+" you have gotten a successful authentication, you can now close this tab")
      access_code={
        "access_token":oauthAccessToken,
        "access_secret":oauthAccessTokenSecret
      }
      session.twitter.authEmitter.emit("accessCodeOK",access_code)
    }
  });
})


//google calendar callback
app.get("/calendar/callback", function(req,res){
  access_code = req.query.code
  console.log(req.query)
  //console.log(req)
  res.send("Successful Authentication, you can close this window")
  session.calendar.authEmitter.emit("accessCodeOK",access_code)
})


//###################### External API##################################

/* Given a type of meal (e.g. pasta, hamburger, sandwich...), the maximum calories you want to eat, an array of ingredients
   you want to include and exclude, it returns a possible recipe. */
app.get("/apimeatballs/getrecipe/:sub_name",
  function(req,res){
    sub_name = req.params.sub_name
    max_calories = req.query.max_calories
    var excluded_ingredients = req.query.excluded_ingredients
    var included_ingredients = req.query.included_ingredients

    if(excluded_ingredients == undefined){
      var excluded_ingredients = ""
    }
    if(included_ingredients == undefined){
      var included_ingredients = ""
    }

    console.log(excluded_ingredients)
    console.log(included_ingredients)
    console.log(max_calories)
    if(!isNaN(sub_name) || isNaN(max_calories) || !isNaN(excluded_ingredients) || !isNaN(included_ingredients)){
      res.status(400)
    }
    excluded_ingredients_array = excluded_ingredients.split("-")
    included_ingredients_array = included_ingredients.split("-")

    session.spoonacular.getMealComplex(sub_name,max_calories,excluded_ingredients_array,included_ingredients_array).then(
      function(result){
        meal = result
        return session.spoonacular.recipeById(meal.id)
      },
      function(error){
        console.log(error)
        res.status(500).send("Error in External API query")
      }
    ).then(
      function(result_2){
        recipe = result_2
        meal.recipe = recipe
        delete meal.id
        res.send(meal)
      },
      function(error_2){
        console.log(error_2)
        res.status(500).send("Error in External API query")
      }
    )
  }
)

/* Given a single ingredient, it returns all the nutritional values. */
app.get("/apimeatballs/nutritionalvalues",
  function(req,res){
    ingredient = req.query.ingredient
    if(!isNaN(ingredient)){
      ws.status(400)
    }
    session.mongoDB.getIngredientbyName(ingredient).then(
      function(result){
        ingredientId = result
        if(ingredientId == null){
          console.log("Ingredient not found")
          res.status(404).send("Ingredient not found")
        }
        else{
          session.spoonacular.getNutritionalsById(ingredientId).then(
            function(result_2){
              console.log("Eeeee "+result_2)
              res.send(result_2)
            },
            function(error_2){
              console.log(error_2)
              res.status(500).send("Error in getting nutritions")
            }
          )
        }
      },
      function(error){
        console.log(error)
        res.status(500).send("Error in verify ingredient")
      }
    )
  }
)

/* Given the maximum calories and the maximum fat you want to eat, it returns a lists of product you can buy in a supermarket. */
app.get("/apimeatballs/shoppinglist/:product_type",
  function(req,res){
    product_type = req.params.product_type
    max_calories = req.query.max_calories
    max_fat = req.query.max_fat
    if(!isNaN(product_type) || isNaN(max_calories) || isNaN(max_fat)){
      res.status(400)
    }
    //console.log(product_type)
    session.spoonacular.getGroceryProducts(product_type,max_calories,max_fat).then(
      function(result){
        res.send(result)
      },
      function(error){
        console.log(error)
        ws.status(500).send("Error in External API query")
      }
    )
  }
)

app.listen(5000)
