const opener = require("opener")
const express = require("express")

app = express()

var gesu = opener("http://localhost:8080/sessions/connect")
