const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const UserInteraction = require('./userInteraction')
const auth = require("../middleware/auth")


const app = express()
app.use(bodyParser.json())
const port = process.env.PORT3 || 3300
mongoose.connect('mongodb://localhost:27017/userInteractionDB',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})


// app.get("/all", (req, res)=>{
//     // console.log("a new get request")
//     UserInteraction.find().sort([['reads', -1]])
//         .then((contents)=>res.json(contents))
//         .catch(err=>res.json({message: err.message}))
// })

app.get("/all/",auth, (req, res)=>{
    UserInteraction.find().sort([[`${req.query.type}`, -1]])
        .then((contents)=>res.json(contents))
        .catch(err=>res.json({message: err.message}))
})

app.get("/interaction",auth, async(req, res)=>{
    try{
        let content = await UserInteraction.findOne({content_id: req.query.content_id})
        if(content == null){
            res.json({message: "Wrong content ID!!"})
        }
        res.json(content)
    }catch(err){
        res.json(err=>res.json({message: err.message}))
    }
})

app.post('/interaction',auth, (req, res)=>{
    console.log("a new request")
    const newUserInteration = new UserInteraction({
        content_id: req.query.content_id,
        likes: 0,
        reads: 0
    })
    newUserInteration.save()
        .then(()=>res.json({message: "Interaction created Successfully"}))
        .catch(err=>res.json({message: err.message}))
})

app.delete("/interaction/",auth, async(req, res)=>{
    console.log(req.query.content_id)
    try{
        let content = await UserInteraction.findOneAndDelete({content_id: req.query.content_id})
        if(content === null)
            return res.json({message: "Nothing to delete!!!"})
        res.json({message: "Interaction deleted successfully"})
    }catch(err){
        res.json({message: err.message})
    }
})

app.post("/like/",auth, async(req, res)=>{
    try{
        let content = await UserInteraction.findOne({content_id: req.query.content_id})
        if(content == null){
            res.json({message: "Wrong content ID!!"})
        }
        content.likes +=1 
        await content.save()
        res.json({message: "Like count increased!"})
    }catch(err){
        res.json(err=>res.json({message: err.message}))
    }
    
})
app.post("/read/",auth, async(req, res)=>{
    try{
        let content = await UserInteraction.findOne({content_id: req.query.content_id})
        if(content == null){
            res.json({message: "Wrong content ID!!"})
        }
        content.reads +=1 
        await content.save()
        res.json({message: "Read count increased!!!"})
    }catch(err){
        res.json(err=>res.json({message: err.message}))
    }
})



app.listen(port, ()=>{
    console.log(`Server is running at port: ${port}`)
})