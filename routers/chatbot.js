const mongoDB = require("./mongoDB.js")
const spoonacular = require('./spoonacular.js');
const calendar = require('./calendar.js');
express = require("express")
enablews = require("express-ws")

auth_status = 0
main_status = 0
sub_flow_status = 0
ingredients_3_meals = ""
meals_json = ""
diet = ""
excluded_ingredients = ""
recipe_ID = ""
calories_meals_json = {}

function main_chatbot(ws){
  ws.send('Inserisci username')

  ws.on("message",msg =>{

    //Authentication
    if (auth_status!=3){
      switch (auth_status) {

        //Start point
        case 0:
            var User_Promise =  mongoDB.getUserPassword(msg)
            User_Promise.then(
              function(res) {
                user = msg
                password = res
                if(password == "")
                {
                  ws.send("L'account non esiste")
                  ws.send("Inserisci una password per creare un account")
                  auth_status = 1
                }
                else
                {
                  ws.send("Inserisci la password")
                  auth_status = 2
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
              mongoDB.createUser(user,password)
              ws.send("User creato")
              ws.send("Benvenuto "+user)
              ws.send("Scrivere help per avere la lista dei comandi")
              auth_status = 3
            }catch(err){
              ws.send("ERROR: "+err)
              ws.close()
            }
          break;

        // user registrato - controllo password
        case 2:
            if(password != msg){
              ws.send("Reinserire password")
              auth_status = 2
            }
            else{
              ws.send("Password corretta")
              ws.send("Benvenuto "+user)
              ws.send("Scrivere help per avere la lista dei comandi")
              auth_status = 3
            }
          break;

        default:
      }
    }

    //Start the real chat
    else{
      //Debug print
      console.log("\n")
      console.log("msg= "+msg)
      console.log("main_status= "+main_status)
      console.log("sub_flow_status= "+sub_flow_status)

      //Give help to user
      if(msg == "help"){
        if (main_status==0){
          ws.send("exit - esci dal programma")
          ws.send("menu - torna al menu principale")
          ws.send("recipe ingredients - fa partire il flow per scegliere il pasto")
        }
        if (main_status==1){
          ws.send("exit - esci dal programma")
          ws.send("menu - torna al menu principale")
        }
        if (main_status==2){
          ws.send("exit - esci dal programma")
          ws.send("menu - torna al menu principale")
        }
      }

      //Close the chat
      if(msg == "exit"){
        ws.close()
      }

      //Redirect user to main menu
      if(msg == "menu"){
        main_status = 0
        ws.send("Sei tornato al menu principale")
      }

      switch (main_status) {
        //Main Page
        case 0:
          chat_flow_router(msg,ws)
          break;

        //Spoonacular Page
        case 1:
          meals_flow(msg,ws)
          break;

        //Template
        case 2:
          meals_planner(msg,ws)
          break;

        default:
          ws.close()
      }
    }
  })

  ws.on('close',()=>{
    console.log("connection closed")
  })

}


//Choose chat flow by starting message
function chat_flow_router (msg, ws){
  switch (msg) {
    case "recipe ingredients":
      ws.send("Type your ingredients, end with 'finish'") //start mex for 3_meals_request
      main_status = 1
      return
      break;

    case "meals planner":
      ws.send("Hom many calories do you need?")
      main_status = 2
      break;

    default:
      if (msg!="help"&&msg!="exit"&&msg!="menu")
      ws.send("I don't know what you mean")
      main_status = 0
      return

  }
}


function meals_flow(msg,ws){
  switch (sub_flow_status) {

    case 0:
      ingredients_3_meals = ""

      if(msg == "reset"){
        sub_flow_status = 0
        main_status = 0
        ws.send("Sei tornato al menu principale")
        return
      }

      else if(msg == "finish"){
          console.log("User ended the ingredients")
          var promise_meals_by_ingredients = spoonacular.mealsByIngredient(ingredients_3_meals)
          promise_meals_by_ingredients.then(
            function(result){
              meals_json = result
              //console.log(meals_json)
              answer = get_meals_string(meals_json)
              ws.send("choose youre recipe, type 1 or 2 or 3")
              ws.send(answer)
              sub_flow_status = 1
              return

            },
            function(reject){
              ws.send("ERROR: "+reject)
              ws.close()
            })
      }

      else{
        if (msg != "help" && msg != "exit"){
          console.log(msg)
          var Ingredient_Promise =  mongoDB.checkIngredients(msg)
          Ingredient_Promise.then(
            function(res) {
              if(res == null){
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
      }

      break;

    case 1:
      if(isNaN(msg) && parseInt(msg) > 3 && parseInt(msg) < 1){
        ws.send("This is not a valid number, type again or 'exit' or 'menu'")
        return 1
      }
      console.log("case 1 enter")
      recipe_ID = meals_json["body"][parseInt(msg) - 1]["id"]
      recipeById_promise = spoonacular.recipeById(recipe_ID)
      recipeById_promise.then(function(result){
          ws.send("This is your recipe, have a good meals!")
          ws.send(result)
          ws.send("Se compare il messaggio, ha funzionato, quindi hai un ricetta speciale")
          ws.send("Cazzi ai cereali")
          //reset variables
          ingredients_3_meals = ""
          meals_json = ""

          sub_flow_status = 0
          main_status = 0
          ws.send("Sei tornato al menu principale")
          return
      },function(reject){
        ws.close()
      })

      break;

    default:

  }
}

function meals_planner(msg,ws){
  switch (sub_flow_status) {
    case 0:
      console.log("meals_planner, status----> 0")
      if(!isNaN(msg)){    //msg should be calories ---> chack
        //funzione provvisoria
        mealsByCalories_promise = dailyMealsByCalories_prova()//DEFNITIVA ---> spoonacular.mealsByCalories(msg, diet,excluded_ingredients)  //return
        mealsByCalories_promise.then(
          function(result){
            calories_meals_json = result
            console.log(result)
            ws.send("Here is your recipe")
            ws.send(calories_meals_stringfy(result))      //funzione per trasformare i JSON in stringa
            ws.send("type yes to accept or no to obtain new recipes")
            sub_flow_status = 1
          },
          function (error){
            ws.send(error)
            ws.close()
          }
        )
      }

      break;

    case 1:
      console.log("meals_planner, status----> 1")
      if(msg == "yes"){
        //###breakfast###
        console.log("Eseguito")
        console.log("Breakfast")
        date = new Date()                           //salva su DB
        if(date.getHours()>8){
          date.setDate(date.getDate()+1)
        }
        mongoDB.createMeal(calories_meals_json.breakfast.id, calories_meals_json.breakfast.title,null).then(
          function(result){
            calendar.createEvent(user,"devi mangiare",calories_meals_json.breakfast.title+"\nID= "+calories_meals_json.breakfast.id, date).then(
              function(result_2){
                return mongoDB.createMeal(calories_meals_json.launch.id, calories_meals_json.launch.title,null)
              },
              function(error_2){
                ws.send(error_2)
                ws.close()
              }
            )
          },
          function(error){
            console.log(error)
            ws.send(error)
            ws.close()
          }
        ).then(//per vedere se funziona correttamente
          function(result){
            console.log("Eseguito")
            console.log("launch")
            date = new Date()                           //salva su DB
            if(date.getHours()>13){
              date.setDate(date.getDate()+1)
            }
            calendar.createEvent(user,"devi mangiare",calories_meals_json.launch.title+"\nID= "+calories_meals_json.launch.id, date).then(
              function(result_2){
                return mongoDB.createMeal(calories_meals_json.dinner.id, calories_meals_json.dinner.title,null)
              },
              function(error_2){
                ws.send(error_2)
                ws.close()
              }
            )

          },
          function(error){
            ws.send(error)
            ws.close()
          }
        ).then(
          function(result){
            console.log("Eseguito")
            console.log("launch")
            date = new Date()                           //salva su DB
            if(date.getHours()>20){
              date.setDate(date.getDate()+1)
            }
            calendar.createEvent(user,"devi mangiare",calories_meals_json.dinner.title+"\nID= "+calories_meals_json.dinner.id, date).then(
              function(result_2){
                ws.send("All meals saved!!!")
              },
              function(error_2){
                ws.send(error_2)
                ws.close()
              }
            )

          },
          function(error){
            ws.send(error)
            ws.close()
          }
        )
      }else{
        //scrivere per il caso no
      }

    default:

  }
}


function twittter_flow(msg,ws){

}


//get string version of meals
function get_meals_string (api_meals){
  console.log(api_meals.body)
  result = ""
  for (var k = 0; k < 3; k++){
    var n = k + 1;
    missingIngredientsNumber = api_meals.body[k].missedIngredientCount;
    result = result + "Option " + n +") is: " + api_meals.body[k].title + "\nId is: " + api_meals.body[k].id +  "\nHere are the " + missingIngredientsNumber + " missing ingredients: ";
    for (var i = 0; i < missingIngredientsNumber; i++){
      result = result + "\n" + api_meals.body[k].missedIngredients[i].name ;
    }
    result = result + "\n\n"
  }
  return result;
}


//funzione provvisoria per stringare il json
function calories_meals_stringfy(meals_json){
  result_string = ""
  for(i in meals_json){
    result_string = result_string + meals_json[i].title + "\n" + meals_json[i].id +"\n"+ "Tocca farlo meglio \n"
  }

  return result_string
}

//funzione di prova, da eliminare in futuro
function dailyMealsByCalories_prova(){
  return new Promise(
    function(resolve,reject){
      spoonacular_object = {
        "breakfast":{
          "id": 368974,
          "title": 'Breakfast Mess'
        },
        "launch":{
          "id": 368955,
          "title": "Paula's Flyin' Fryin' UFOs"
        },
    		"dinner":{
          "id": 157163,
          "title": 'Israeli Couscous With Chicken Sausage And Over-Easy Eggs'
        }
      }

      resolve(spoonacular_object)
    }
  )
}


module.exports = {
  main_chatbot
}
