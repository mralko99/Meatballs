var oauth = require('oauth');
var opener = require("opener")
var dotenv = require("dotenv").config()
var http = require("http")
const mongoDB = require('./mongoDB');
var Twitter = require('twitter');


function consumer(){
  return new oauth.OAuth(
    "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
    process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET, "1.0", "http://127.0.0.1:8080/sessions/callback", "HMAC-SHA1"
  )
}

function RequestToken(session){
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
function createCalendar(user,name){
  console.log()
  return new Promise(
    function(resolve,reject) {
      getAccessTokenUser(user).then(
        function (result) {
          url = create_calendar_endpoint+"?key="+api_key

          body = {"summary":name}
          headers = {
            "Authorization": "Bearer "+result,
            "Accept": "application/json"
          }
          console.log("[createCalendar] Start creating calendar, request data: \nurl: "+url+"\nheaders: "+JSON.stringify(headers))
          request.post({url:url, body:body, "json":true,headers:headers},
            function(err,response,body){
              console.log(body)
              if(err) reject(err)
              console.log("[createCalendar] Updateing calendarId data on DB..")
              console.log(body.id)
              updateCalendarId_promise = mongoDB.updateCalendarId(user, body.id)
              updateCalendarId_promise.then(
                function(result_2){ resolve(body.id) },
                function(error_2){ reject(error_2) }
              )
            }
          )
        },
        function(error){ reject(error) }
      )
    }
  )
}

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
  Post_Local
}