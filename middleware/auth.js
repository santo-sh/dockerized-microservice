const axios = require('axios')

const auth = async(req, res, next)=>{
    try{
        const token = req.query.token
        if(token === undefined){
            throw Error("Login or Signup to generate a token!!")
        }
        console.log(token)
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