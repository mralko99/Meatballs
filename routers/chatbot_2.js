const express = require('express')
const enablews = require( 'express-ws')
const mongoDB = require("./mongoDB.js")

const app = express ()
enablews(app)

const start_endpoint = "/chatbot"


app.ws(start_endpoint, (ws,req)=> {

  status = 0
  ws.send('insert username')
  ws.on("message",msg =>{
    switch (status) {

      //start point
      case 0:
          var myPromise =  mongoDB.findUser(msg)
          myPromise.then(
            function(ritorno) {
              user = msg
              password = ritorno
              if(password == "")
              {
                ws.send("L'account non esiste")
                ws.send("Inserisci una password per creare un account")
                status = 1
              }
              else
              {
                ws.send("Inserisci la password")
                status = 2
              }
            },
            function(error) {
              ws.send("error found: "+err+", send a message to disconnect")
              ws.close()
            }
          )
        break;

      // user non registrato - creazione entry DB
      case 1:
          password = msg
          try{
            mongoDB.createUser(user,password)
            ws.send("User creato")
            ws.send("Benvenuto "+user)
            status = 3
          }catch(error){
            ws.send("error found: "+error+", send a message to disconnect")
            ws.close()
          }
        break;

      // user registrato - controllo password
      case 2:
          if(password != msg){
            ws.send("Reinserire password")
            status = 2
          }
          else{
            ws.send("Password corretta")
            ws.send("Benvenuto "+user)
            status = 3
          }
        break;

      // start chat
      case 3:
          if(msg == "ricetta"){
            ws.send("Cazzi ai cereali")
          }
        break;

      default:
    }
  })

  ws.on('close',()=>{
    console.log("connection closed")
  })

})

app.listen(5000)
