function post_twitter(ws,msg,session){

  switch (session.sub_flow_status) {
    case 0:
      if (msg.length<280){
        session.post=msg;
        if (session.recipe_ID!=""){
          session.mongoDB.getMealById(session.recipe_ID).then(
            function(result){
              session.post=session.post.replace("/name/",result.name)
              ws.send("This would be your post:\n"+session.post);
              ws.send('If you want to post it use "post"');
              ws.send('If you want to abort use "menu"');
              session.sub_flow_status=1;
            },
            function(error){
              console.error(error)
              ws.close()
            }
          )
        }
        else{
          ws.send("This would be your post:\n"+session.post);
          ws.send('If you want to post it use "post"');
          ws.send('If you want to abort use "menu"');
          session.sub_flow_status=1;
        }
      }
      else{
        ws.send("Your message is too long")
      }
      break;

    case 1:
      if (msg=="post"){
        session.twitter.RequestToken(session,ws).then(
          function(res){
            session.twitter.post(session.post,res.access_token,res.access_secret)
            ws.send("You are now on the main menu")
            session.sub_flow_status = 0
            session.main_status = 1
          },
          function(err){
            console.error(err)
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