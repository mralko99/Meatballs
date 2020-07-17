express = require("express")
enablews = require("express-ws")
dotenv = require("dotenv").config()
calendar = require("./routers/calendar")

app = express()
enablews(app)

const chatbot = require("./routers/chatbot.js")

app.ws("/chatbot", (ws,req)=> {
  chatbot.main_chatbot(ws)
})

app.get("/twitter/callback", (ws,req)=> {

})

//google calendar callback
app.get("/calendar/callback", function(req,res){
  access_code = req.query.code
  console.log(req.query)
  //console.log(req)
  res.send("access code got!!!"+access_code)
  console.log("ATTENZIONE IMPORTANTE!!!!"+JSON.stringify(req.query))
  calendar.authEmitter.emit("accessCodeOK",access_code)
})



app.get("/calendar/callback", (ws,req)=> {

})

app.listen(5000)
