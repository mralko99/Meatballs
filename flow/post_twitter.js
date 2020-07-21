function post_twitter(ws,msg,session){

  switch (session.sub_flow_status) {
    case 0:
      session.post=msg;
      ws.send("This would be your post:\n"+session.post);
      ws.send('If you want to post it use "post"');
      ws.send('If you want to abort use "menu"');
      session.sub_flow_status=1;
      break;

    case 1:
      if (msg=="post"){
        session.twitter.RequestToken(session,ws).then(
          function(res){
            session.twitter.post(session.post,res.access_token,res.access_secret)
            ws.send("Sei tornato al menu principale")
            session.sub_flow_status = 0
            session.main_status = 1
          },
          function(err){
            ws.send(err)
            ws.close()
          }
        )
      }
      else {
        ws.send("Incorrect command")
      }
      break;

    case 2:
      break;

    default:

  }
}

module.exports = {
  post_twitter
}