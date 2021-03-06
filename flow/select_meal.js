function select_meal(ws,msg,session){
  if (isNaN(msg)||msg==" "){
    session.mongoDB.selectRecipe(session.user,msg).then(
      function(res){
        session.result=res
        for(i = 0; i < res.length; i++){
          ws.send(i+") "+res[i].name)
        }
      },
      function(err){
        console.error(err)
        ws.close()
      }
    )
  }
  else{
    if (parseInt(msg)>=session.result.length||parseInt(msg)<0){
      ws.send("Choice not valid")
    }
    else{
      session.recipe_ID=session.result[parseInt(msg)].id
      ws.send("You successfully select "+session.result[parseInt(msg)].name)
      session.main_status=1
    }
  }
}

module.exports = {
  select_meal
}