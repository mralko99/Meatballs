const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dotenv = require("dotenv").config();

//connecting to the database
const URI = process.env.MONGODB_URI;
const client = new MongoClient(URI);

client.connect(function(err) {
  if(err) throw err;
  console.log("Connected successfully to server");
});

function insertDB(req, meals){
    const db = client.db(process.env.DB_NAME);
    db.collection('meals').insertOne(req.body, function(err, res) {
      if(err) throw err;
      console.log("Successfully inserted into the database!");
    });
};

client.close();
module.exports.insertDB = insertDB;
