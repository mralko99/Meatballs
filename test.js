opener = require('opener')

opener("http://127.0.0.1:5000/apimeatballs/getrecipe/pizza?max_calories=2500")

opener("http://127.0.0.1:5000/apimeatballs/nutritionalvalues?ingredient=flour")

opener("http://127.0.0.1:5000/apimeatballs/shoppinglist/:butter?max_calories=2500&max_fat=200")
