express = require("express")

app = express()

calendar = require("./calendar")

auth_url = "https://accounts.google.com/o/oauth2/v2/auth"

calendar_scope = "https://www.googleapis.com/auth/calendar"

redirect_uri = "http://localhost:1234/test_auth"

client_id = "82794785693-68v6o2ab2o9vfmstis28fqnq55jmmoud.apps.googleusercontent.com"

access_code = ""     //"4/1wGfDb_kqj7K_jcHfMLz7hyA_jd2BwEZI6xPOSwvxKWItAO4_fzURtBZGf-3D7VND5Bojw0MIh4JWXyo6VL29ug"



app.get("/test_calendar/get_code", function(req,res){
  res.redirect(auth_url+"?client_id="+client_id+"&redirect_uri="+redirect_uri+"&scope="+calendar_scope+"&response_type=code")

})

app.get("/test_calendar/get_code_opener", function(req,res){
  calendar.getAuthCode()

})


//#################put in app.js!!!!
app.get("/test_auth", function(req,res){
  access_code = req.query.code
  res.send("access code got!!!"+access_code)
})
//###############################



app.get("/test_calendar/get_token", function(req,res){
  calendar.getAccessToken(access_code, "http://localhost:1234/test_auth")
  res.send("getting token....")
})



app.get("/test_calendar/create_calendar", function(req,res){

  name = req.query.name

  calendar.create_calendar(name)
})

app.listen("1234")
