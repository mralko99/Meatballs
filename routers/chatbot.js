const express = require('express');
const enablews = require( 'express-ws');
//const telegraf = require('telegraf');


//const bot = new telegraf("1166884910:AAFhIYrIDLHWiKeULeGk0WLr6VmgRTudcbs")

const app = express ()

enablews(app)

/*
bot.start((ctx) => ctx.reply("Welcome!\nSend /start to start conversation"))
bot.command('start', (ctx) => ctx.reply)
*/

app.ws("/echo", (ws,req)=> {

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

  ws.on('close',()=>{
    console.log("connection closed")

  })
})

app.listen(5000)
