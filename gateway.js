const express = require('express')
require('dotenv').config()
const port = process.env.PORT
const routes = require("./routes")

console.log(process.env.PORT)

const app = express()
app.use(express.json())
app.use('/', routes)

app.listen(port, ()=>{
    console.log(`Gateway is starting at port: ${port}`)
})