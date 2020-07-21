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

  ws.send('Inserisci username')

  session.main_status=0 // test
  session.sub_flow_status=0

  session.recipe_ID=""

  ws.on("message",msg =>{
    if (session.main_status>=1&&(msg == "help"||msg == "exit"||msg == "menu")){
      if(msg == "help"){
        ws.send("Ti sei perso nello status:"+session.main_status+" sub_status:"+session.sub_flow_status)
        ws.send("exit - esci dal programma")
        ws.send("menu - torna al menu principale")
        if (session.main_status==1){
          ws.send("recipe ingredients - fa partire il flow per scegliere il pasto")
        }
      }

      //Close the chat
      else if(msg == "exit"){
        ws.send("Ti sei disconnesso dalla sessione")
        ws.close()
      }

      //Redirect user to main menu
      else if(msg == "menu"){
        session.main_status = 1
        ws.send("Sei tornato al menu principale")
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
        /*
        case 6:

          break;
        /*
        case 7:

          break;
        /*
        case 8:

          break;
        */
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

      res.send(results.screen_name+" puoi chiudere la scheda")
      //FAI LA CHIAMATA CON AUTH EMITTER
      access_code={
        "access_token":oauthAccessToken,
        "access_secret":oauthAccessTokenSecret
      }
      session.twitter.authEmitter.emit("accessCodeOK",access_code)
      //twitter.Post_Local("ciao mi chiamo "+results.screen_name,oauthAccessToken,oauthAccessTokenSecret)
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
