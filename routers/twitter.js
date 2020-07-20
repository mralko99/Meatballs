var express = require('express');
var util = require('util');
var oauth = require('oauth');
//var twitter = require('twitter');
var twitter = require('./twitter_test2.js');
var session = require('express-session')


var app = express();


app.get('/sessions/connect', function(req, res){
  twitter.RequestToken(session)
});

app.get('/sessions/callback', function(req, res){

  twitter.consumer().getOAuthAccessToken(req.query.oauth_token, session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token : " + util.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+util.inspect(results)+"]", 500);
    } else {

      console.log("AccessToken Obtained")

      res.send(results.screen_name+" puoi chiudere la scheda")
      twitter.Post_Local("ciao mi chiamo "+results.screen_name,oauthAccessToken,oauthAccessTokenSecret)
    }
  });
});

app.listen(8080, function() {
  console.log('App running on port 8080!');
});