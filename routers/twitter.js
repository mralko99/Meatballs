oauth = require('oauth');
opener = require("opener")
dotenv = require("dotenv").config()
events = require('events');
Twitter = require('twitter');

authEmitter =  new events.EventEmitter()


function consumer(){
  return new oauth.OAuth(
    "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
    process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET, "1.0", "http://127.0.0.1:5000/twitter/callback", "HMAC-SHA1"
  )
}

function RequestToken(session,ws){
  return new Promise(function(resolve,reject){
    session.mongoDB.getTwitterInfo(session.user).then(
      function(res){
        if(res.twitterToken == null || res.twitterSecret == null){
          ws.send("This is your first time using twitter so you must Authente first")
          consumer().getOAuthRequestToken(function(err_2, oauthToken, oauthTokenSecret, res_2){
            if (err_2) {
              reject(err_2)
            }
            else {
              session.oauthRequestTokenSecret = oauthTokenSecret;
              console.log("RequestToken Obtained")
              opener("https://twitter.com/oauth/authorize?oauth_token="+oauthToken);
              authEmitter.on("accessCodeOK", (res_3)=>{
                session.mongoDB.updateTwitterToken(session.user,res_3.access_token,res_3.access_secret)
                resolve(res_3)
              })
            }
          });
        }
        else{
          access_code={
            "access_token":res.twitterToken,
            "access_secret":res.twitterSecret
          }
          resolve(access_code)
        }
      },
      function(err){
        reject(err)
      }
    )
  })
}

function post(Testo,access_public,access_secret){
  const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: access_public,
    access_token_secret: access_secret
  })
  client.post("statuses/update", { status: Testo }, function(error, tweet, response) {
    if (error) {
      console.log(error)
    } else {
      console.log("You successfully post the tweet")
    }
  })
}

module.exports = {
  RequestToken,
  consumer,
  post,
  authEmitter
}