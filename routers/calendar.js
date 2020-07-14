var request = require("request")

var opener = require("opener")

const dotenv = require("dotenv")

const mongoDB = require('./mongoDB');

dotenv.config()


auth_url = "https://accounts.google.com/o/oauth2/v2/auth"

calendar_scope = "https://www.googleapis.com/auth/calendar"

redirect_uri = "http://localhost:1234/test_auth"

token_request_url = "https://oauth2.googleapis.com/token"


//api HTTP endpoints
create_calendar_endpoint = "https://www.googleapis.com/calendar/v3/calendars"
//


client_id = process.env.GOOGLE_CLIENT_ID

api_key = process.env.GOOGLE_API_KEY

client_secret = process.env.GOOGLE_CLIENT_SECRET



access_token = ""




//open browser and visualizes authorization window
function getAuthCode(){
  opener(auth_url+"?client_id="+client_id+"&redirect_uri="+redirect_uri+"&scope="+calendar_scope+"&response_type=code")
}


//get access token function
function getAccessToken(code, redirect_uri){
  url = token_request_url

  body = {
    "code":code,
    "client_id":client_id,
    "client_secret":process.env.GOOGLE_CLIENT_SECRET,
    "redirect_uri":redirect_uri,
    "grant_type":"authorization_code"
  }
  console.log(body)
  return new Promise(function(resolve,reject){
      request.post({
        url:url,body:body,"json":true
      },function(err,response,body){
        if(error){
          reject(error)
        }

        body_json = body
        resolve(body_json.access_token)
        console.log("request_token_message_response "+JSON.stringify(response))
        console.log("request_token_message_response "+JSON.stringify(body))
      })
  )}

}



function create_calendar(name){
  return new Promise (function(resolve,reject) {

      url = create_calendar_endpoint+"?key="+api_key

      body = {"summary":name}
      console.log(name)
      headers = {"Authorization": "Bearer "+access_token,
                 "Accept": "application/json"
      }
      request.post({
        url:url,
        body:body,
        "json":true,
        headers:headers}, function(err,response,body){
        console.log(body)
      }, function (error, res, body){

        if(error) reject(error)

        resolve(res)
      })

  })
}

function createEvent(user, accessToken,title, description, startDateTimeString){  //datetime String, format ---> October 13, 2014 11:13:00
  return new Promise(function(resolve,reject){
      accessToken = getAccessTokenUser(user)
      calendarId = getCalendarId(user)

      url = "https://www.googleapis.com/calendar/v3/calendars/"+calendarId+"/events?key="+api_key
      headers = {"Authorization": "Bearer "+access_token,
                 "Accept": "application/json"
      }


      startDateTime = new Date(startDateTimeString)
      if(startDateTime == "Invalid Date"){
        reject("Invalid Date")
      }
      endDateTime = new Date(startDateTimeString)

      endDateTime.setMinutes(endDateTime.getMinutes() + 60)

      body = {
        "summary":title,
        "description":description,
        "start":{
          "dateTime":startDateTime
        },
        "end":{
          "dateTime":endDateTime
        }
      }

      request.post({
        url:url, headers:headers, body:body, "json":true
      }, function(error, res,body){
        if(error){
          reject(error)
        }
        resolve(true)

      })


  })

}

function getAccessTokenUser(user){
      getCalendarInfo_promise = mongoDB.getCalendarInfo(user)
      getCalendarInfo_promise.then(function(resolve){
      accessToken = resolve.accessToken
      accessCode = resolve.accessCode
      accessTokenEmissionTimestamp = resolve.calendarTimeStamp

      accessTokenAge = Date.now() - accessTokenEmissionTimestamp

      if(accessTokenAge < process.env.GOOGLE_CALENDAR_TIMESTAMP_DURATION - 10000){
        return accessToken
      }else{
        getAccessToken_promise = getAccessToken(accessCode, redirect_uri)
        getAccessToken_promise.then(function(result){
        return result
        },function (reject){
          console.error(reject);
        })
      }
    })
}

function getCalendarId(user) {

    getCalendarInfo_promise = mongoDB.getCalendarInfo(user)
    getCalendarInfo_promise.then(function(resolve){
    caledarId = resolve.getCalendarId
    return calendarId
  }, function(error){
    console.error(error);
  })



}

}
module.exports = {
  getAuthCode,
  getAccessToken,
  create_calendar,
  createEvent
}
