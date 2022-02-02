const mongoose = require('mongoose')

const AuthSchema =  new mongoose.Schema({
    user_id:{
        type: mongoose.Types.ObjectId,
        required: true,
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
})

const Auth = mongoose.model('Auth', AuthSchema)

module.exports = Auth