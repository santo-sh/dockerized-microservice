const express = require('express')
const router = express.Router()
const axios = require('axios')
const registry = require('./registry.json')
const fs = require('fs')

router.all('/:apiName/:path', (req, res)=>{
    // console.log(req.params.apiName)
    // console.log(req.params.apiName)
    // console.log(req.body)
    if(registry.services[req.params.apiName] === undefined){
        return res.send("API Name doesn't exist")
    }
    console.log(req.query)
    axios({
        method: req.method,
        url: registry.services[req.params.apiName].url+req.params.path,
        data:  req.body,
        params: req.query,
    })
    .then((response)=>res.json(response.data))
    .catch((err)=>res.json({message: err.message}))
})

router.post('/register', (req, res, next)=>{
    const registrationInfo = req.body
    registry.services[registrationInfo.apiName] = {...registrationInfo }
    fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err)=>{
        if(err){
            return res.send(`Couldn't register ${registrationInfo.apiName}`)
        }
        res.send("Successfully registered")
    })
})



module.exports = router