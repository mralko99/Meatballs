var request = require("request")

var opener = require("opener")

const dotenv = require("dotenv")

const mongoDB = require('./mongoDB');

const events = require('events');

dotenv.config()


auth_url = "https://accounts.google.com/o/oauth2/v2/auth"

calendar_scope = "https://www.googleapis.com/auth/calendar"

redirect_uri = "http://localhost:5000/calendar/callback"

token_request_url = "https://oauth2.googleapis.com/token"


//api HTTP endpoints
create_calendar_endpoint = "https://www.googleapis.com/calendar/v3/calendars"
//

GOOGLE_CALENDAR_TIMESTAMP_DURATION = 5000000
CALENDAR_TOKEN_TOLERANCE = 20000

client_id = process.env.GOOGLE_CLIENT_ID

api_key = process.env.GOOGLE_API_KEY

client_secret = process.env.GOOGLE_CLIENT_SECRET



access_token = ""

authEmitter =  new events.EventEmitter()


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
  return new Promise(function(resolve,reject){
      request.post({
        url:url,body:body,"json":true
      },function(error,response,body){
        if(error){
          reject(error)
        }

        body_json = body
        resolve(body_json.access_token)
      })
  })

}



function createCalendar(session,name){
  return new Promise(
    function(resolve,reject) {
      getAccessTokenUser(session.user).then(
        function (result) {
          url = create_calendar_endpoint+"?key="+api_key

          body = {"summary":name}
          headers = {
            "Authorization": "Bearer "+result,
            "Accept": "application/json"
          }
          request.post({url:url, body:body, "json":true,headers:headers},
            function(err,response,body){
              if(err) reject(err)
              updateCalendarId_promise = session.mongoDB.updateCalendarId(user, body.id)
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

function createEvent(session, title, description, startDateTimeString){  //datetime String, format ---> October 13, 2014 11:13:00
  return new Promise(function(resolve,reject){
      getAccessTokenUser(session.user).then(
        function(result){
          access_token = result
          getCalendarId_promise = getCalendarId(session.user)
          getCalendarId_promise.then(
            function(result){
              calendarId = result
              url = "https://www.googleapis.com/calendar/v3/calendars/"+calendarId+"/events?key="+api_key
              headers = {
                "Authorization": "Bearer "+access_token,
                "Accept": "application/json"
              }

              startDateTime = new Date(startDateTimeString)
              if(startDateTime == "Invalid Date"){
                reject("Invalid Date")
              }
              endDateTime = new Date(startDateTimeString)

              endDateTime.setMinutes(endDateTime.getMinutes() + 60)
              startDateTime.setMinutes(0)
              endDateTime.setMinutes(0)

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

              request.post({ url:url, headers:headers, body:body, "json":true},
                function(error,res,body){
                  if(error){
                    reject(error)
                  }
                  resolve("Success")
                }
              )
            },
            function(error){
              throw error
            })
        },
        function(error){
          throw error
        })
  })
}

function getAccessTokenUser(session){
  return new Promise(
    function(resolve,reject){
      getCalendarInfo_promise = session.mongoDB.getCalendarInfo(user)
      getCalendarInfo_promise.then(
        function(result){
          accessToken = result.calendarToken
          accessCode = result.calendarAccessCode
          accessTokenEmissionTimestamp = result.calendarTimeStamp
          if(accessToken == null || accessCode == null || accessTokenEmissionTimestamp == null){
            //avvia login
            getAuthCode()
            authEmitter.on("accessCodeOK", (accessCode_msg)=>{
              accessCode = accessCode_msg
              getAccessToken_promise = getAccessToken(accessCode, redirect_uri)
              getAccessToken_promise.then(
                function(result_2){
                  accessToken = result_2
                  updateCalendarToken_promise = session.mongoDB.updateCalendarToken(session.user,accessToken,Date.now(), accessCode)
                  updateCalendarToken_promise.then(
                    function(result_update){
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
          else if(Date.now() - accessTokenEmissionTimestamp < GOOGLE_CALENDAR_TIMESTAMP_DURATION - CALENDAR_TOKEN_TOLERANCE){
            resolve(accessToken)
          }
          else{
            getAccessToken_promise = getAccessToken(accessCode, redirect_uri)
            getAccessToken_promise.then(
              function(result_2){
                accessToken = result_2
                updateCalendarToken_promise = session.mongoDB.updateCalendarToken(user,accessToken,Date.now(), accessCode)
                updateCalendarToken_promise.then(
                  function(result_update){
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



function getCalendarId(session) {
  return new Promise(
    function(resolve,reject){
      session.mongoDB.getCalendarInfo(session.user).then(
        function(result){
          calendarId = result.calendarId
          if(calendarId == undefined || calendarId == null){
            createCalendar(session.user,"Diet").then(
              function(result_2){
                resolve(result_2)
              },
              function(error_2){
                reject(error_2)
              }
            )
          }
          else{
            resolve(calendarId)
          }
        },
        function(error){
          reject(error)
        }
      )
    }
  )
}



module.exports = {
  getAuthCode,
  getAccessToken,
  createCalendar,
  createEvent,
  authEmitter
}
