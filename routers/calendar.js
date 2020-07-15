var request = require("request")

var opener = require("opener")

const dotenv = require("dotenv")

const mongoDB = require('./mongoDB');

const events = require('events');

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

authEmitter =  new events.EventEmitter()


//open browser and visualizes authorization window
function getAuthCode(){
  console.log()
  opener(auth_url+"?client_id="+client_id+"&redirect_uri="+redirect_uri+"&scope="+calendar_scope+"&response_type=code")
  console.log("Start getting AuthCode...");
}
/*
function setAuthEmitter(emitter){
  var authEmitter = emitter
}
*/

//get access token function
function getAccessToken(code, redirect_uri){
  console.log()
  url = token_request_url

  body = {
    "code":code,
    "client_id":client_id,
    "client_secret":process.env.GOOGLE_CLIENT_SECRET,
    "redirect_uri":redirect_uri,
    "grant_type":"authorization_code"
  }
  return new Promise(function(resolve,reject){
      console.log("Starting Request for Access Token...\n"+body);
      request.post({
        url:url,body:body,"json":true
      },function(error,response,body){
        if(error){
          reject(error)
        }

        body_json = body
        resolve(body_json.access_token)
        console.log("request_token_message_response: "+ body_json.access_token)
      })
  })

}



function create_calendar(user,name){
  console.log()
  return new Promise (function(resolve,reject) {

      url = create_calendar_endpoint+"?key="+api_key

      body = {"summary":name}
      headers = {"Authorization": "Bearer "+access_token,
                 "Accept": "application/json"
      }
      console.log("Start creating calendar, request data: \n"+body)
      request.post({
        url:url,
        body:body,
        "json":true,
        headers:headers}, function(err,response,body){
        console.log(body)
      }, function (error, res, body){

        if(error) reject(error)
        conosle.log("Updateing calendar data on DB..")
        updateCalendarId_promise = mongoDB.updateCalendarId(user, body.id)
        updateCalendarId_promise.then(function(result){
          resolve(true)

        }, function(reject){
          reject(reject)
        })
      })

  })
}

function createEvent(user, accessToken,title, description, startDateTimeString){  //datetime String, format ---> October 13, 2014 11:13:00
  return new Promise(function(resolve,reject){
    console.log()
      accessToken = getAccessTokenUser(user)
      calendarId = getCalendarId(user)
      consolo.log("creating new event, user: "+user)
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
      console.log("Request for a new event, request body: \n"+body)

      request.post({
        url:url, headers:headers, body:body, "json":true
      }, function(error, res,body){
        conosle.log("Event creation result ")
        if(error){
          reject(error)
        }
        resolve(true)

      })


  })

}

function getAccessTokenUser(user){
      console.log()
      getCalendarInfo_promise = mongoDB.getCalendarInfo(user)
      getCalendarInfo_promise.then(function(resolve){
      accessToken = resolve.accessToken
      accessCode = resolve.accessCode
      accessTokenEmissionTimestamp = resolve.calendarTimeStamp

      accessTokenAge = Date.now() - accessTokenEmissionTimestamp
      console.log("User access token got, tokenAge: "+accessTokenAge+", user: "+user)
      if(accessToken == null){
        //avvia login
        getAuthCode()
        authEmitter.on("accessCodeOK", (accessCode)=>{
          getAccessToken_promise = getAccessToken(accessCode, redirect_uri)
          getAccessToken_promise.then(function(result){
            accessToken = result
            return mongoDB.updateCalendarToken(user,result,Date.now(), accessCode)
          }, function(error){
            throw error
          }).then(function(result){
            console.log("accessToken updated on DB")
            return accessToken
          }, function(error){
            throw error
          })
        })

      }else if(accessTokenAge < process.env.GOOGLE_CALENDAR_TIMESTAMP_DURATION - 10000){
        return accessToken
      }else{
        console.log("Getting new accessToken...")
        getAccessToken_promise = getAccessToken(accessCode, redirect_uri)
        getAccessToken_promise.then(function(result){
        accessToken = result

        return mongoDB.updateCalendarToken(user,result,Date.now(), accessCode)

        },function (reject){
          console.error(reject);
          throw error
        }).then(function(result){
          console.log("accessToken updated on DB")
          return accessToken
        }, function(error){
          throw error
        })
      }


    })
}



function getCalendarId(user) {
    console.log()
    console.log("Getting calendarId, user: "+user)
    getCalendarInfo_promise = mongoDB.getCalendarInfo(user)
    getCalendarInfo_promise.then(function(resolve){
    caledarId = resolve.getCalendarId
    console.log("Returning new calendarId: "+calendarId)
    return calendarId
  }, function(error){
    throw error
  })
}



module.exports = {
  getAuthCode,
  getAccessToken,
  create_calendar,
  createEvent,
  authEmitter
}
