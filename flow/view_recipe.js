function view_recipe(ws,msg,session){

  if(session.recipe_ID == ""){
    ws.send("No meal selected!!")
  }
  else{
    session.mongoDB.getMealById(session.recipe_ID).then(
      function(result){
        ws.send("The recipe for: "+result.name)
        ws.send(result.recipe)
        session.main_status = 1
      },
      function(error){
        ws.send("ERROR"+error)
        ws.close()
      }
    )
  }
}

module.exports = {
  view_recipe
}