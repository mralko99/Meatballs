express = require("express")
enablews = require("express-ws")
dotenv = require("dotenv").config()
oauth = require('oauth');
session = require('express-session')

calendar = require("./routers/calendar")
twitter = require("./routers/twitter")
chatbot = require("./routers/chatbot.js")

app = express()
enablews(app)

app.ws("/chatbot", (ws,req)=> {
  chatbot.main_chatbot(ws,session)
})

app.get("/twitter/callback", (req,res)=> {
  twitter.consumer().getOAuthAccessToken(req.query.oauth_token, session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token "+error);
    } else {

      console.log("AccessToken Obtained")

      res.send(results.screen_name+" puoi chiudere la scheda")
      //FAI LA CHIAMATA CON AUTH EMITTER
      twitter.Post_Local("ciao mi chiamo "+results.screen_name,oauthAccessToken,oauthAccessTokenSecret)
    }
  });
})

//google calendar callback
app.get("/calendar/callback", function(req,res){
  access_code = req.query.code
  console.log(req.query)
  //console.log(req)
  res.send("Successful Authentication, you can close this window")
  calendar.authEmitter.emit("accessCodeOK",access_code)
})

app.listen(5000)
