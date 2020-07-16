express = require("express")
enablews = require("express-ws")
mongoose = require('mongoose')
dotenv = require("dotenv").config()

app = express()
enablews(app)

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

const chatbot = require("./routers/chatbot.js")
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.ws("/chatbot", (ws,req)=> {
  chatbot.main_chatbot(ws)
})

app.get("/twitter/callback", (ws,req)=> {

})

app.get("/calendar/callback", (ws,req)=> {

})

mongoose.connection.close()
app.listen(5000)
