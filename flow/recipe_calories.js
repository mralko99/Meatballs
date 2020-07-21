function recipe_calories(ws,msg,session){
  //session.user = "ale2"
  switch (session.sub_flow_status) {
    case 0:
      console.log("meals_planner, status----> 0")
      if(!isNaN(msg)){    //msg should be calories ---> chack
        //funzione provvisoria
        mealsByCalories_promise = session.spoonacular.mealsPlanning(msg,"",""); //dailyMealsByCalories_prova()//DEFNITIVA ---> spoonacular.mealsByCalories(msg, diet,excluded_ingredients)  //return
        mealsByCalories_promise.then(
          function(result){
            calories_meals_json = result
            console.log(result)
            ws.send("Here is your recipe")
            ws.send(session.spoonacular.mealsPlanning_Stringify(result))      //funzione per trasformare i JSON in stringa
            ws.send("type yes to accept or no to obtain new recipes")
            session.sub_flow_status = 1
          },
          function (error){
            ws.send(error)
            ws.close()
          }
        )
      }
      break;

    case 1:
      if(msg == "yes"){
        //###breakfast###
        console.log("Breakfast")
        date = new Date()                           //salva su DB
        if(date.getHours()>8){
          date.setDate(date.getDate()+1)
        }
        date.setHours(8)
        ws.send("Breakfast at "+date)
        session.mongoDB.associateMeal(session.user,calories_meals_json.breakfast.id, calories_meals_json.breakfast.title,null).then(
          function(result){
            return session.calendar.createEvent(session.user,"devi mangiare",calories_meals_json.breakfast.title+"\nID= "+calories_meals_json.breakfast.id, date)
          },
          function(error){
            console.log(error)
            ws.send(error)
            ws.close()
          }
        ).then(
          function(result_2){
            ws.send("Breakfast OK!! ")
            return session.mongoDB.associateMeal(session.user,calories_meals_json.lunch.id, calories_meals_json.lunch.title,null)
          },
          function(error_2){
            ws.send(error_2)
            ws.close()
          }
        ).then(
          function(result_3){
            console.log("h")
            date = new Date()                           //salva su DB
            if(date.getHours()>13){
              date.setDate(date.getDate()+1)
            }
            date.setHours(13)
            ws.send("lunch at "+date)
            return session.calendar.createEvent(session.user,"devi mangiare",calories_meals_json.lunch.title+"\nID= "+calories_meals_json.lunch.id, date)
          },
          function(error_3){
            ws.send(error_2)
            ws.close()
          }
        ).then(
          function(result_4){
            ws.send("lunch OK!!")
            return session.mongoDB.associateMeal(session.user,calories_meals_json.dinner.id, calories_meals_json.dinner.title,null)
          },
          function(error_4){
            ws.send(error_2)
            ws.close()
          }
        ).then(
          function(result_5){
            console.log("Dinner")
            date = new Date()                           //salva su DB
            if(date.getHours()>20){
              date.setDate(date.getDate()+1)
            }
            date.setHours(20)
            ws.send("Dinner at "+date)
            return session.calendar.createEvent(session.user,"devi mangiare",calories_meals_json.dinner.title+"\nID= "+calories_meals_json.dinner.id, date)
          },
          function(error_5){
            ws.send(error_2)
            ws.close()
          }
        ).then(
          function(result_6){
            ws.send("Dinner OK!!")
            ws.send("All meals saved!!!")
            session.sub_flow_status = 0
            session.main_status = 1
            ws.send("Sei tornato al menu principale")
          },
          function(error_6){
            ws.send(error_6)
            ws.close()
          }
        )
      }else if (msg == "no"){
        session.sub_flow_status = 0
        ws.send("Type again your calories")
      }else{
        ws.send("Please type yes or no")
      }
      break;

    default:

  }
}

function dailyMealsByCalories_prova(){
  return new Promise(
    function(resolve,reject){
      spoonacular_object = {
        "breakfast":{
          "id": 368974,
          "title": 'Breakfast Mess'
        },
        "lunch":{
          "id": 368955,
          "title": "Iraq Lobster"
        },
    		"dinner":{
          "id": 157163,
          "title": 'Israeli Couscous With Chicken Sausage And Over-Easy Eggs'
        }
      }

      console.log(spoonacular_object)
      resolve(spoonacular_object)
    }
  )
}
module.exports = {
  recipe_calories
}
