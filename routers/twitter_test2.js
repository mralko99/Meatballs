var oauth = require('oauth');
var opener = require("opener")
var dotenv = require("dotenv").config()
var Twitter = require('twitter');

authEmitter =  new events.EventEmitter()


function consumer(){
  return new oauth.OAuth(
    "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
    process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET, "1.0", "http://127.0.0.1:8080/sessions/callback", "HMAC-SHA1"
  )
}

function RequestToken(session){/*
  return new Promise(function(resolve,reject){
  //RETURN PROMISES
  session.mongoDB.getTwitterInfo(session.user).then(
    function(res){
      if(res.twitterToken == null || res.twitterSecret == null){
        consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
          if (error) {
            res.send("Error getting OAuth request token : " + util.inspect(error), 500);
          } else {
            session.oauthRequestTokenSecret = oauthTokenSecret;
            console.log("RequestToken Obtained")
            opener("https://twitter.com/oauth/authorize?oauth_token="+oauthToken);
          }
        });
      }
    },
    function(err){
      reject(err)
    }
  )
  consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token : " + util.inspect(error), 500);
    } else {
      session.oauthRequestTokenSecret = oauthTokenSecret;
      console.log("RequestToken Obtained")
      opener("https://twitter.com/oauth/authorize?oauth_token="+oauthToken);
    }
  });
})*/
}

function Post_Local(Testo,access_public,access_secret){
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
      console.log(tweet)
    }
  })
}
/*
function getAccessTokenUser(user){
  return new Promise(
    function(resolve,reject){
      console.log()
      getCalendarInfo_promise = mongoDB.getCalendarInfo(user)
      getCalendarInfo_promise.then(
        function(result){
          console.log("[getAccessTokenUser] Response from DB: "+JSON.stringify(result))
          accessToken = result.calendarToken
          accessCode = result.calendarAccessCode
          accessTokenEmissionTimestamp = result.calendarTimeStamp
          console.log("[getAccessTokenUser] Obtained from DB: \naccessToken = "+accessToken+"\naccessCode= "+accessCode+"\naccessTookenEmissionTimestamp= "+accessTokenEmissionTimestamp+"\n")
          if(accessToken == null || accessCode == null || accessTokenEmissionTimestamp == null){
            //avvia login
            getAuthCode()
            authEmitter.on("accessCodeOK", (accessCode_msg)=>{
              accessCode = accessCode_msg
              getAccessToken_promise = getAccessToken(accessCode, redirect_uri)
              getAccessToken_promise.then(
                function(result_2){
                  accessToken = result_2
                  updateCalendarToken_promise = mongoDB.updateCalendarToken(user,accessToken,Date.now(), accessCode)
                  updateCalendarToken_promise.then(
                    function(result_update){
                      console.log("[getAccessTokenUser] accessToken updated on DB")
                      resolve(accessToken)
                    },
                    function(error_3){
                      reject(error_3)
                    }
                  )
                },
                function(error_2){
                  reject(error_2)
                }
              )
            })
          }
          else if(Date.now() - accessTokenEmissionTimestamp < process.env.GOOGLE_CALENDAR_TIMESTAMP_DURATION - 20000){
            console.log("[getAccessTokenUser] Token ancora valido!")
            resolve(accessToken)
          }
          else{
            console.log("[getAccessTokenUser] Getting new accessToken...")
            getAccessToken_promise = getAccessToken(accessCode, redirect_uri)
            getAccessToken_promise.then(
              function(result_2){
                accessToken = result_2
                updateCalendarToken_promise = mongoDB.updateCalendarToken(user,accessToken,Date.now(), accessCode)
                updateCalendarToken_promise.then(
                  function(result_update){
                    console.log("[getAccessTokenUser] accessToken updated on DB")
                    resolve(accessToken)
                  },
                  function(error_3){
                    reject(error3)
                  }
                )
              },
              function (error_2){
                reject(error_2)
              }
            )
          }
        },
        function(error){
          reject(error)
        }
      )
    }
  )
}
*/

module.exports = {
  RequestToken,
  consumer,
  Post_Local,
  authEmitter
}