function view_recipe(ws,msg,session){

  if(session.recipe_ID == ""){
    ws.send("No meal selected!!")
  }
  else{
    session.mongoDB.getMealById(session.recipe_ID).then(
      function(result){
        //IMPLEMENTARE SE LA RECIPE E'VUOTA FARE LA QUERY CON SPOONACULAR
        console.log(result)
        ws.send("The recipe for: "+result.title)
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