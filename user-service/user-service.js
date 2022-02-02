const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path =  require('path')
const User = require('./User')
const jwt = require('jsonwebtoken')
const auth = require('../auth-microservice/auth')
const cookieParser = require('cookie-parser')
const SHA256 = require("crypto-js/sha256")
const { default: axios } = require('axios')
const { response } = require('express')
require('dotenv').config()

console.log(process.env.PORT1)

const app = express()
const port = process.env.PORT1 || 3100
app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({
    extended: true
}))

mongoose.connect('mongodb://localhost:27017/userDB')

const generateAuthToken = async (user)=>{
    const token = jwt.sign({_id: user._id}, 'thisissecret', {expiresIn: '10h'})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

app.get('/users' ,(req, res)=>{
    try{
        User.find()
        .then(users=>res.json(users))
        .catch(err=>{
            if(err){
                throw new Error(err.message)
            }
        })        
    }catch(err){
        res.json({message: err.message})
    }
})

app.get('/', (req, res)=>{
    try{
        res.redirect("http://localhost:3200/contents")
    }catch(err){
        res.json({message: err.message})
    }
})

app.post('/login', async(req, res)=>{
    // console.log(req)
    let email_id = req.body.email_id
    email_id = email_id.toLowerCase()
    let password =  SHA256(req.body.password).toString()
    try{
        const user = await User.findOne({email_id: email_id})
        // console.log(user)
        if(!user){
            return res.json({message: "User not registered!! Please signup using a valid email"})
        }
        if(user.password !== password){
            return res.json({message: "Incorrect Password"})
        }
        const token = await generateAuthToken(user)
        axios.post(`http://localhost:3400/?user_id=${user._id}&token=${token}`)
            .then((response)=>{
                if(response.data['message'].includes('failed')){
                    res.json({message: response.data['message']})
                }else{
                    console.log(token)
                    res.status(201).json({user, token})
                }
            })
            .catch((err)=>{
                res.json({message: err.message})
            })
    }catch(error){
        console.log(error.message)
        res.json({message:error.message})
    }
})

app.post('/signup', (req, res)=>{
    // console.log(req)
    const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name == null? "": req.body.last_name,
        email_id: req.body.email_id.toLowerCase(),
        password: SHA256(req.body.password), 
        phone_no: req.body.phone_no == null ? 0: req.body.phone_no
    })
    try{
        newUser.save()
        .then(async()=>{
            const token = await generateAuthToken(newUser)
            console.log(token)
            axios.post(`http://localhost:3400/?user_id=${newUser._id}&token=${token}`)
            .then((response)=>{
                if(response.data['message'].includes('failed')){
                    res.json({message: response.data['message']})
                }else{
                    console.log(token)
                    res.status(200).json({newUser, token})
                }
            })
            .catch((err)=>{
                res.json({message: err.message})
            })
        })
        .catch(err=>res.json({message: err.message}))
    }catch(err){
        res.json({message: err.message})
    }
    
})

app.put('/users/', (req, res)=>{
    const id = req.query.user_id
    console.log(id)
    User.findByIdAndUpdate(id,{
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email_id: req.body.email_id,
        // password: SHA256(req.body.password).toString(),
        password: req.body.password,
        phone_no: req.body.phone_no 
    }, (err, user)=>{
        if(err){
            res.status(500)
            return res.json({message: err.message})
        }
        if(user === null){
            return res.json({message: "Wrong user id!!!"})
        }
        res.status(200)
        res.json({message: "User updated successfully"})
    })
})

app.delete('/users/', async(req, res)=>{
    try{
        console.log(req.query.user_id)
        const user = await User.findByIdAndDelete(req.query.user_id)
        console.log(user)
        if(user === null){
            return res.json({message: "User not present!!!"})
        }
        axios.delete(`http://localhost:3000/contentApi/deleteall/?user_id=${user._id}`)
            .then((response)=>{
                console.log(response.data)
                res.json({message: "User deleted successfully!"})
            })
            .catch(err=>{
                throw new Error(err)
            })
    }catch(err){
        res.json({message: err.message})
    }
})

app.listen(port, ()=>{
    console.log(`user-content server is running at port: ${port}`)
})