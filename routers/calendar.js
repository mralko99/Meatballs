var request = require("request")

var opener = require("opener")

const dotenv = require("dotenv")

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
  request.post({
    url:url,body:body,"json":true
  },function(err,response,body){
    if(err){
      console.error("token request failed");
      console.error("error: "+err.name+" message: "+err.message)
    }

    body_json = body
    access_token = body_json.access_token
    console.log("request_token_message_response "+JSON.stringify(response))
    console.log("request_token_message_response "+JSON.stringify(body))
  })

}



function create_calendar(name){
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
    if(errprthrow err
    console.log(error)
    console.log(res)
  })


function createEvent(calendarID, accessToken,title, description, startDateTime){
  
}




}
module.exports = {
  getAuthCode,
  getAccessToken,
  create_calendar,
}
