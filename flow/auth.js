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
              ws.send("This account does not exist")
              ws.send("Insert a password to create the account")
              session.sub_flow_status = 1
            }
            else
            {
              ws.send("Insert the password")
              session.sub_flow_status = 2
            }
          },
          function(err) {
            console.error(err)
            ws.close()
          }
        )
      break;

    // user non registrato - creazione entry DB
    case 1:
        password = msg
        try{
          session.mongoDB.createUser(session.user,password)
          ws.send("User created")
          ws.send("Welcome Back, "+session.user)
          ws.send('Type "help" to have a list of commands')
          session.sub_flow_status = 0
          session.main_status = 1
        }catch(err){
          console.error(err)
          ws.close()
        }
      break;

    // user registrato - controllo password
    case 2:
        if(password != msg){
          ws.send("Wrong password, try again")
          session.sub_flow_status = 2
        }
        else{
          ws.send("Correct password")
          ws.send("Welcome Back, "+session.user)
          ws.send('Type "help" to have a list of commands')
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