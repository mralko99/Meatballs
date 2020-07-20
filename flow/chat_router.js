view_recipe =require("./view_recipe");

function chat_router(ws,msg,session){
  switch (msg) {
    case "recipe ingredients":
      ws.send("Type your ingredients, end with 'finish'")
      session.main_status = 2
      break;

    case "meals planner":
      ws.send("How many calories do you need?")
      session.main_status = 3
      break;

    case "select meal":
      ws.send("Search for a keyword or type a number to select the recipe")
      session.mongoDB.selectRecipe(session.user,"").then(
        function(res){
          session.result=res
          for(i = 0; i < res.length; i++){
            ws.send(i+") "+res[i].name)
          }
        },
        function(err){
          ws.send(err)
          ws.close()
        }
      )
      session.main_status = 4
      break;

    case "post twitter":
      ws.send("Hom many calories do you need?")
      session.main_status = 5
      break;

    case "view recipe":
      view_recipe.view_recipe(ws,msg,session)
      break;

    default:
      ws.send("I don't know what you mean")
      session.main_status = 1
      return

  }
}

module.exports = {
  chat_router
}