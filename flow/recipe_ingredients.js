function recipe_ingredients(ws,msg,session){

  switch (session.sub_flow_status) {
    case 0:
        ingredients_3_meals = ""
        meals_json = ""
        var Ingredient_Promise =  session.mongoDB.checkIngredients(msg)
        Ingredient_Promise.then(
          function(res) {
            if(res){
              ingredients_3_meals = msg
            }
            else{
              ws.send("L'ingrediente non è valido")
            }
            session.sub_flow_status=1
          },
          function(err) {
            ws.send("ERROR:"+err)
            ws.close()
          }
        )
      break;

    case 1:

      if(msg == "finish"){
        if (ingredients_3_meals != ""){
          console.log("User ended the ingredients")
          session.spoonacular.mealsByIngredient(ingredients_3_meals).then(
            function(result){
              meals_json = result
              answer = session.spoonacular.mealsByIngredient_Stringify(meals_json)
              ws.send("choose youre recipe, type 1 or 2 or 3")
              ws.send(answer)
              session.sub_flow_status = 2
              return

            },
            function(reject){
              ws.send("ERROR: "+reject)
              ws.close()
            })
        }
        else {
          ws.send("Insert at least one ingredients")
        }
      }

      else{
        var Ingredient_Promise =  session.mongoDB.checkIngredients(msg)
        Ingredient_Promise.then(
          function(res) {
            if(!res){
              ws.send("L'ingrediente non è valido")
            }
            else{
              if(ingredients_3_meals == ""){
                ingredients_3_meals = msg
              }
              else{
                ingredients_3_meals = ingredients_3_meals+ "2%C" +msg
              }
            }
          },
          function(err) {
            ws.send("ERROR:"+err)
            ws.close()
          }
        )
        return
      }

      break;

    case 2:
      if(isNaN(msg) && parseInt(msg) > 3 && parseInt(msg) < 1){
        ws.send("This is not a valid number, type again or 'exit' or 'menu'")
        return 1
      }
      recipe_ID = meals_json[parseInt(msg) - 1]["id"]
      recipeById_promise = session.spoonacular.recipeById(recipe_ID)
      recipeById_promise.then(
        function(recipe){
          ws.send("This is your recipe, have a good meals!")
          session.mongoDB.associateMeal(user, meals_json[parseInt(msg) - 1]["id"], meals_json[parseInt(msg) - 1]["title"], recipe).then(
            function(result){
              //non so che mettere
            },
            function(error){
              ws.send("ERROR:"+error)
              ws.close()
            }
          )
          session.sub_flow_status = 0
          session.main_status = 1
          ws.send("Sei tornato al menu principale")
          return
        },
        function(reject){
          ws.close()
        }
      )

      break;

    default:

  }
}

module.exports = {
  recipe_ingredients
}