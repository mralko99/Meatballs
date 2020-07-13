const express = require('express');
const enablews = require( 'express-ws');
//const telegraf = require('telegraf');

const mongoDB = require("./mongoDB.js")

const app = express ()

enablews(app)

const start_endpoint = "/chatbot"

const TRY_NUMBER = 3


app.ws(start_endpoint, (ws,req)=> {

  status = 0

  ws.send('insert username')

  ws.on("message",msg =>{
    switch (status) {
      //start point
      case 0:
        //password = ""
        try{
           mongoDB.findUser(msg)
           password = mongoDB.password
           user = msg
           //console.log(password)
           if(password == ""){
             ws.send("l'account non esiste, inserisci una password per crearne uno")
             status = 1
           }else{
             status = 2
             ws.send("insert password")
           }
        }catch(err){
          ws.send("error found: "+err+"send a message to disconnect")
          ws.close()
        }

        break;

      // user non registrato - creazione entry DB
      case 1:
          //inserire funzione per salvare utente
            password = msg
            try{
              mongoDB.createUser(user,password)
              ws.send("User creato, benvenuto "+ user+" "+password)
              //inserire funzione per salvare utente
              status = 3
            }catch(error){
              ws.send("error found: "+error+"send a message to disconnect")
              ws.close()
            }

        break;

      // user registrato - controllo password
      case 2:
        while(password != msg){
          ws.send("Reinserire password")
          status = 2
        }

        ws.send("Password corretta")
        ws.send("Benvenuto "+ user+" "+password)
        statsu = 3
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


function registrato(ws){
  ws.send("Benvenuto, utente registrato")
}


app.listen(5000)
