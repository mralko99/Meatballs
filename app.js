express = require("express");
enablews = require("express-ws");
dotenv = require("dotenv").config();
oauth = require('oauth');
session = require('express-session');
unirest = require("unirest");

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

app.ws("/chatbot", (ws,req)=> {

  ws.send('Insert username')

  session.main_status=0 // test
  session.sub_flow_status=0

  session.recipe_ID=""

  ws.on("message",msg =>{
    if (session.main_status>=1&&(msg == "help"||msg == "exit"||msg == "menu")){
      if(msg == "help"){
        ws.send("Current status:"+session.main_status+" & sub_status:"+session.sub_flow_status)
        ws.send("exit - quit from the chat")
        if (session.main_status!=1){
          ws.send("menu - go back to main menu")
        }
        if (session.main_status==1){
          ws.send("recipe ingredients - start the flow to find a meal")
          ws.send("meal planner - start the flow to find start a diet with calendar")
          ws.send("select meal - search from previously viewed meal to select them")
          ws.send("post twitter - start the flow to find a meal")
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


//###################### External API##################################à
app.get("/apimeatballs/getrecipe/:sub_name",
  function(req,res){
    sub_name = req.params.sub_name
    max_calories = req.query.max_calories
    exculded_ingredients = req.query.exculded_ingredients
    excluded_ingredients_array = excluded_ingredients.split("-")




  }
)
app.listen(5000)
