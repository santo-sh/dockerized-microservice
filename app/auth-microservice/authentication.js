const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken') 
const Auth = require('./Auth-user')

const app = express()
app.use(express.json())
const port = process.env.PORT4 || 3400
console.log(port)
mongoose.connect('mongodb://localhost:27017/authDB',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.post('/', (req, res)=>{
    const user_id = req.query.user_id
    const token = req.query.token
    const newAuth = new Auth({
        user_id: user_id,
    })
    newAuth.tokens = newAuth.tokens.concat({token})
    newAuth.save()
        .then(()=>{
            console.log(newAuth)
            res.json({message: "authToken created successfully"})
        })
        .catch(err=>res.json({message: err.message}))

})

app.get('/', async(req, res)=>{
    const token = req.query.token
    console.log(token)
    try{
        const decoded = await jwt.verify(token, 'thisissecret')
        const user = await Auth.findOne({user_id: decoded._id, 'tokens.token':token})
        console.log(user)
        if(!user){
            // res.status(404)
            return res.json({message: "Token not valid!!!"})
        }
        res.userData = {
            user_id: decoded._id,
            token: token
        }
        console.log(req.userData)
        res.json(user)
    }catch(err){
        res.json({message: err.message})
    }
})

app.delete('/', async(req, res)=>{
    const token = req.query.token
    try{
        const decoded = jwt.verify(token, 'thisissecret')
        const user = await Auth.findOneAndDelete({user_id: decoded._id, 'tokens.token':token})
        console.log(user)
        if(user === null){
            throw new Error("Nothing to delete")
        }
        res.json(user)
    }catch(err){
        res.json({message: err.message})
    }
})

app.listen(port, ()=>{
    console.log(`Server is running at port: ${port}`)
})