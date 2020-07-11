
var request = require("request")

auth_url = "https://accounts.google.com/o/oauth2/v2/auth"

calendar_scope = "https://www.googleapis.com/auth/calendar"

redirect_uri = "http://localhost:1234/test_auth"

client_id = "82794785693-68v6o2ab2o9vfmstis28fqnq55jmmoud.apps.googleusercontent.com"

token_request_url = "https://oauth2.googleapis.com/token"

client_secret = "83g3NJuyobsIVx6XOTss154S"

access_token = "ya29.a0AfH6SMAXXks6xShgdHCHOngofj4fAIQqkEUtvZJckdhd43UENPL0W54BdGLVWoi8yL22LqJWuYMcVQPKAvsKUwB7frAMrYZOmbPTAD5p_c6ay5Qd4EwjFvJZJ49N_fBLxs_rqc5XoAIwpyR3Z6N8LKHW3yab2lhDQr0"

opener = require("opener")


function getAuthCode(){
  opener(auth_url+"?client_id="+client_id+"&redirect_uri="+redirect_uri+"&scope="+calendar_scope+"&response_type=code")

}


function getAccessToken(code, redirect_uri){
  url = token_request_url
  //headers = {"Content-Type":"application/x-www-form-urlencoded"}
  body = {
    "code":code,
    "client_id":client_id,
    "client_secret":client_secret,
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

function log_token(access_token){
    console.log(access_token)
}

function create_calendar(name){
  url = "https://www.googleapis.com/calendar/v3/calendars"+"?key="+"AIzaSyAuyIrXHOgdaesCVGQC1nSsWicEQXg4zzU"

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
  })
}
module.exports = {
  getAuthCode,
  getAccessToken,
  log_token,
  create_calendar,
}
