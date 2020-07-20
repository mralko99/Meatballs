function auth(ws,msg,session){
  switch (session.sub_flow_status) {
    case 0:
        var User_Promise =  session.mongoDB.getUserPassword(msg)
        User_Promise.then(
          function(res) {
            session.user = msg
            password = res
            if(password == "")
            {
              ws.send("L'account non esiste")
              ws.send("Inserisci una password per creare un account")
              session.sub_flow_status = 1
            }
            else
            {
              ws.send("Inserisci la password")
              session.sub_flow_status = 2
            }
          },
          function(err) {
            ws.send("ERROR:"+err)
            ws.close()
          }
        )
      break;

    // user non registrato - creazione entry DB
    case 1:
        password = msg
        try{
          session.mongoDB.createUser(session.user,password)
          ws.send("User creato")
          ws.send("Benvenuto "+session.user)
          ws.send('Scrivere "help" per avere la lista dei comandi')
          session.sub_flow_status = 0
          session.main_status = 1
        }catch(err){
          ws.send("ERROR: "+err)
          ws.close()
        }
      break;

    // user registrato - controllo password
    case 2:
        if(password != msg){
          ws.send("Reinserire password")
          session.sub_flow_status = 2
        }
        else{
          ws.send("Password corretta")
          ws.send("Benvenuto "+session.user)
          ws.send('Scrivere "help" per avere la lista dei comandi')
          session.sub_flow_status = 0
          session.main_status = 1
        }
      break;

    default:
  }
}

module.exports = {
  auth
}