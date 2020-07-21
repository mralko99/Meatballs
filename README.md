# Meatballs :hamburger:

![Logo](https://external-preview.redd.it/PxYPalqae7fMR0A-piAKk9sUdLqxpQKEgbo9pm9Oj9Q.jpg?auto=webp&s=a81a7d26d8d1bfe127a13d47f21fbabba6bc95c8)

Meatballs is a web application born with the intent to **satiate** food-related needs of our clients, keeping an eye on the ambient and on the wallet, the whole with the ultimate goal to provide a healthy and tasty diet.
What Meatballs consists of is a user friendly chatbot who will supply many options for your diet, eventually taking into account food intolerances, ingredients you already possess and don't want to waste and many others features.
It's possible to find the architecture schema..........


## Technologies Used

* Runtime environment
  * Node.js

* Node web Framework
  * Express

* Websocket endpoints
  * Express-ws

* HTTP client library  (from Mashape)
  * Unirest

* Database Management System
  * MongoDB


## REST API Used

* Spoonacular
  * https://spoonacular.com/food-api/docs

* Google
  * https://developers.google.com/docs/api

* Twitter
  * https://developer.twitter.com/en/docs


## OAUTH

* Google Calendar (Create events:calendar:)
* Twitter (Share tweets:bird:)



## Getting Started
It's possible to obtain a copy of the project by cloning the repository on Github.  

### Prerequisites

The Node.js modules you have to install in the project folder in order to get the application working are:

```
$ npm install express
$ npm install express-ws
$ npm install dotenv
$ npm install oauth
$ npm install express-session
$ npm install unirest
$ npm install swagger-ui-express
$ npm install request
$ npm install opener
$ npm install events
$ npm install mongoose
$ npm install twitter
```

The module dotenv, installed before through npm install dotenv, allows you to loads environment variables in a file called .env. The file .env contains all the sensitive data or credential you don't want to share with everyone.
Our .env file contains the following data:
```
CONSUMER_KEY
CONSUMER_SECRET
GOOGLE_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
MONGODB_URI
X_RAPIDAPI_HOST
X_RAPIDAPI_KEY
```
To interact with the application, it's necessary a socket chat.


## Running the tests

- [ ] *Explain how to run the automated tests for this system*

### Break down into end to end tests

- [ ] *Explain what these tests test and why*

```
Give an example
```



## Authors

* **Alberto Coluzzi**
* **Gabriele De Santis**
* **Alessandro Gaeta**
* **Alessandro Lamin**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Inspiration
  * Reti di Calcolatori lectures held at Università degli Studi di Roma "La Sapienza" (course year: 2020)
