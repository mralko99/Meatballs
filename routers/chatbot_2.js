const expapi_meals = require('express')
const enablews = require( 'express-ws')
const mongoDB = require("./mongoDB.js")
const spoonacular = require('/spoonacular.js');
const app = express ()
enablews(app)

const start_endpoint = "/chatbot"



app.ws(start_endpoint, (ws,req)=> {

  status = 0
  main_status = 0
  sub_flow_status = 0
  ingredients_3_meals = ""
  meals_json = ""
  ws.send('insert username')
  ws.on("message",msg =>{
    switch (status) {

      //start point
      case 0:
          var myPromise =  mongoDB.findUser(msg)
          myPromise.then(
            function(ritorno) {
              user = msg
              password = ritorno
              if(password == "")
              {
                ws.send("L'account non esiste")
                ws.send("Inserisci una password per creare un account")
                status = 1
              }
              else
              {
                ws.send("Inserisci la password")
                status = 2
              }
            },
            function(error) {
              ws.send("error found: "+err+", send a message to disconnect")
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
            status = 3
          }catch(error){
            ws.send("error found: "+error+", send a message to disconnect")
            ws.close()
          }
        break;

      // user registrato - controllo password
      case 2:
          if(password != msg){
            ws.send("Reinserire password")
            status = 2
          }
          else{
            ws.send("Password corretta")
            ws.send("Benvenuto "+user+" make a request")
            status = 3
          }
        break;

      // start chat
      case 3:

        if(msg == "exit"){  //close if user type exit
          ws.close
        }

        if(msg == "menu"){ //redirect to menù if user type menu
          main_status = 0
          ws.send("Benvenuto "+user+" make a request")
        }

        if(main_status == 0){
              main_status = chat_flow_router(msg,ws)
        }




        switch (main_status) {
          case 1  //enters flow for meals choose
            sub_flow_status = 3_meals_flow(msg,sub_flow_status,ws)

            if(sub_flow_status == 2){
              sub_flow_status = 0
              main_status = 0
              ws.send("Benvenuto "+user+" make a request")
            }
            break;

          case 0:
            //nothing to add
            break;

          default:
            ws.close()
        }

      default:
    }
  })

  ws.on('close',()=>{
    console.log("connection closed")
  })

})


//Choose chat flow by starting message
function chat_flow_router (msg, ws){
  switch (msg) {
    case "give me a meals by ingredients":
      ws.send("Type your ingredients, end with 'finish' or type 'reset'") //start mex for 3_meals_request
      return 1
      break;

    case "test":
      return 2
      break;

    case "stop chat"
      return -1

    default:
      ws.send("I don't know what you mean")
      return 0

  }
}


function 3_meals_flow(msg,status,ws){
  switch (status) {

    case 0:

      if(msg == "reset"){
        ingredients_3_meals = ""
        ws.send("Type your ingredients, end with 'finish' or type 'reset'") //start mex for 3_meals_request
        return 0
      }

      if(msg == "finish"){
          //inserire function per ottenere JSON complicato
          promise_meals_by_ingredients = spoonacular.mealsByIngredient(ingredients_3_meals)
          promise_meals_by_ingredients.then(function(result){
          meals_json = result
          answer = get_meals_string (meals_json)
          ws.send("choose youre recipe, type 1 or 2 or 3")
          ws.send(answer)
          return 1

          },function(reject){
            ws.send("Error foud: "+reject)
            ws.close()
          })


      }else{
          ingredients_3_meals = ingredients_3_meals + "2%C"
          return 0;
      }

      break;

    case 1:
      if(isNaN(msg) && parseInt(msg) > 3 && parseInt(msg) < 1){
        ws.send("This is not a valid number, type again or 'exit' or 'menu'")
        return 1
      }
      recipe_ID = meals_json[parseInt(msg) - 1].id//variablile Id che non ricordo
      //insert funzione per prendere la ricetta+
      ws.send("This is your recipe, have a good meals!")
      ws.send(recipe)
      ws.send("Se compare il messaggio, ha funzionato, quindi hai un ricetta speciale")
      ws.send("Cazzi ai cereali")
      //reset variables
      ingredients_3_meals = ""
      meals_json = ""
      return 2

    break;

    default:

  }
}

//get string version of meals
function get_meals_string (api_meals){
  result = ""
  for (var k = 0; k < 3; k++){
    var n = k + 1;
    missingIngredientsNumber = api_meal.body[k].missedIngredientCount;
    result = result + "Option " + n +") is: " + api_meal.body[k].title + "\nId is: " + api_meal.body[k].id +  "\nHere are the " + missingIngredientsNumber + " missing ingredients: ";
    for (var i = 0; i < missingIngredientsNumber; i++){
      result = result + "/n" + api_meal.body[k].missedIngredients[i].name );
    }
    result = result + "/n"

    return result
}

app.listen(5000)
