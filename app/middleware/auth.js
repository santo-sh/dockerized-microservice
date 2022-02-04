const axios = require('axios')

const auth = async(req, res, next)=>{
    try{
        // console.log(req.cookies.token)s
        console.log(req.headers.authorization)
        if(req.header('authorization')){
            token = req.header('authorization').replace('Bearer ', '')
        }else{
            token = req.cookies.token
        }
        console.log('A new token received', token)
        axios.get(`http://localhost:3400/?token=${token}`)
            .then((response)=>{
                console.log(response.data)
                if(response.data['message']){
                    console.log(response.data)
                    throw Error(response.data['message'])
                }else{
                    next()
                }
            })
            .catch((err)=>{
                res.json({message: err.message})
            }) 
    }catch(error){
        console.log(error)
        res.json({message: error.message})
    }
}

module.exports = auth