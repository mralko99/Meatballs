const express = require("express")
const twitter = require("./twitter")
const dotenv = require("dotenv").config()
const opener = require("opener")
const request = require("request")

app = express()

//auth_url = "https://api.twitter.com/oauth/authorize"
const bearerTokenURL = new URL('https://api.twitter.com/oauth2/token');
oauth_callback = "http://localhost:1234/test_auth"
consumer_key = process.env.CONSUMER_KEY
consumer_secret = process.env.CONSUMER_SECRET

access_code = ""

app.get("/test_auth2", function(req,res){
  //twitter.getAuthCode()
  const requestConfig = {
    url: bearerTokenURL,
    auth: {
      user: consumer_key,
      pass: consumer_secret,
    },
    form: {
      grant_type: 'client_credentials',
    },
  };

  body="grant_type=client_credentials"

  request.get(requestConfig, function(error, res){
    console.log("Response: "+JSON.stringify(res))
    console.log("Error: "+error)
  }
  )
})

app.listen("1234")
