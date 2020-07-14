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

async function bearerToken (auth) {
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

  const response = await post(requestConfig);
  const body = JSON.parse(response.body);

  if (response.statusCode !== 200) {
    const error = body.errors.pop();
    throw Error(`Error ${error.code}: ${error.message}`);
    return null;
  }

  return JSON.parse(response.body).access_token;
}


app.get("/test_auth2", function(req,res){
  (async () => {
    let token;
  token = await bearerToken({consumer_key, consumer_secret});
  })

  console.log(token)
})

app.listen("1234")

