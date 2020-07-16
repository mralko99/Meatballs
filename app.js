express = require("express")
enablews = require("express-ws")
dotenv = require("dotenv").config()

app = express()
enablews(app)

const chatbot = require("./routers/chatbot.js")

app.ws("/chatbot", (ws,req)=> {
  chatbot.main_chatbot(ws)
})

app.get("/twitter/callback", (ws,req)=> {

})

app.get("/calendar/callback", (ws,req)=> {

})

app.listen(5000)
