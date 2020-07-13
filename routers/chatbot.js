const express = require('express');
const enablews = require( 'express-ws');
//const telegraf = require('telegraf');


//const bot = new telegraf("1166884910:AAFhIYrIDLHWiKeULeGk0WLr6VmgRTudcbs")

const app = express ()

enablews(app)

const start_endpoint = "/chatbot"

/*
bot.start((ctx) => ctx.reply("Welcome!\nSend /start to start conversation"))
bot.command('start', (ctx) => ctx.reply)
*/

app.ws(start_endpoint, (ws,req)=> {

  ws.send('insert username')

  ws.on("message",username =>{
    password = get_user(username).password
    password = ""
  })//.then()

  msg=""



       ws.on("message",msg =>{
         if(password == ""){
           console.log(msg)
           if(msg == ""){
             ws.send("l'account non esiste, inserisci una password per crearne uno")
           }else{
           //inserire funzione per salvare utente
            registrato(ws)
          }
         }else{

            if (password!=msg) {
                ws.send("insert password")
            }else {
                ws.send("Password corretta")
                registrato(ws)
            }
         }
      })



  /*
  .then(ws.on('message', msg => {
    ws.send(msg+"kfojofk")
  }))


  /*
  ws.on('message',msg => {
    switch (msg) {
      case 'ciao':
        ws.send('sciao belo')
        break;
      case 'quanto fai?':
        ws.send('30 boca culo')
        break;
      case 'va bene sali':
        ws.send('arrivo belo');
        break;
      case 'polizia':
        ws.send("scappa ammore")
        break;
      default:
        ws.send("Messaggio non valido, niente uccello")

    }
  })
  */

  ws.on('close',()=>{
    console.log("connection closed")

  })
})

function registrato(ws){
  ws.send("Benvenuto, utente registrato")
}


function get_user(user){
  user_json = {
    "password":"test"
  }
  return user_json
}
app.listen(5000)
