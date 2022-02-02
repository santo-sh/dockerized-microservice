const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const csv = require('fast-csv')
const fs = require('fs')
const http = require('http')
const axios = require('axios')
const mongoose = require('mongoose')
const Content = require('./Content')
const User = require('../user-service/User')
const auth = require('../auth-microservice/auth')

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT2 || 3200
mongoose.connect('mongodb://localhost:27017/contentDB')
const server = http.createServer(app)
const Router = express.Router;
const router = new Router()
app.use('/upload-csv', router)

// deleteall is not deleting all the interactions

const upload = multer({ dest: './' })

app.post('/uploadContent/',upload.single('uploaded_file'), (req, res)=>{
    const file = req.file
    console.log(file.filename)
    if(!file){
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return res.json(error)
    }
    console.log(req.user)
    try{
        csv.parseFile(req.file.path)
        .on("data",  (data) =>{
            let newContent = new Content({
                title: data[0],
                story: data[1],
                user_id: req.query.user_id,
                publish_date: Date.now()
            })
            newContent.save()
                .then((content)=>{
                    console.log
                    axios.post(`http://localhost:3300/interaction/?content_id=${content._id}`)
                    .catch(err=>res.json({message: err.message}))
                })
        })
        .on("end", function () {
            // console.log(fileRows)
            fs.unlinkSync(req.file.path)
        })
        res.json({message: "Stories saved successfully"})
    }catch(err){
        res.json({message: err.message})
    }
    
})

app.get('/contents', (req, res)=>{
    Content.find({})
        .then(content=>res.json(content))
        .catch(err=>res.json({message: err.message}))
})  

app.get('/contents/', (req, res)=>{
    Content.findById({user_id: req.query.user_id})
        .then(content=>{
            if(!content){
                return res.json({message: "Wrong Content Id!!!"})
            }
            res.json(content)
        })
        .catch(err=>res.json({message: err.message}))
})

// error
app.post('/contents/', (req, res)=>{
    const newContent = new Content({
        title: req.body.title,
        story: req.body.story,
        publish_date: Date.now(),
        user_id: req.query.user_id,
    })
    try{
        newContent.save()
        .then((content)=>{
            console.log(content._id.toString())
            axios.post(`http://localhost:3300/interaction?content_id=${content._id.toString()}`)
                .then((response)=>{
                    console.log(response.data)
                    return res.json({message: "Content added successfully"})
                })
                .catch((err)=>{
                    return res.json({message: err.message})
                })
        })
        .catch(err=>{
            throw new Error(err)
        })
    }catch(err){
        res.json({message: err.message})
    }
})

app.delete('/contents/', (req, res)=>{
    Content.findOneAndDelete({_id: req.query.content_id, user_id: req.query.user_id})
        .then((content)=>{
            if(!content){
                return res.json({message: "Wrong Content ID or User ID!!!"})
            }
            console.log(content._id.toString())
            axios.delete(`http://localhost:3300/interaction?content_id=${content._id}`)
                .then((response)=>{
                    console.log(response.data)
                    res.json({message: "Content deleted Successfully"})
                })
                .catch(err=>{
                    res.json({message: err.message})
                })
        })
        .catch(err=>res.json({message: err.message}))
})

app.put('/contents/', (req, res)=>{
    Content.findOneAndUpdate({_id: req.query.content_id, user_id: req.query.user_id}, {
        title: req.body.title,
        story: req.body.story
    })
    .then((content)=>{
        // console.log(content)
        if(content === null){
            return res.json({message: "Wrong Content ID or User ID!!"})
        }
        res.json({message: "Content updated Successfully"})
    })
    .catch(err=>res.json({message: err.message}))
})

app.get("/read/", (req, res)=>{
    console.log(req.query.content_id)
    Content.findById(req.query.content_id)
        .then((content)=>{
            if(content === null){
                return res.json({message: "Wrong content id!!"})
            }
            axios.post(`http://localhost:3300/read/?content_id=${req.query.content_id}`)
                .then(()=>res.json(content))
                .catch((err)=>res.json({message: err.message}))
        })
        .catch(err=>res.json({message: err.message}))
})

app.delete('/deleteall', (req, res)=>{
    console.log(req.query.user_id)
    Content.deleteMany({user_id: req.query.user_id})
        .then((content)=>{
            console.log(content)
            if(content.deletedCount === 0){
                return res.json({message: "Nothing to Delete!!!"})
            }
            res.json({message: "All contents with given user_id have been deleted successfull!!!"})
        })
        .catch(err=>res.json({message: err.message}))
})

app.get('/contents/new-content', (req, res)=>{
    
})

app.get('contents/top-content', (req, res)=>{
    
})

server.listen(port,()=>{
    console.log(`Server is running at port: ${port}`)
})