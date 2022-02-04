const mongoose = require('mongoose')
const validator = require('validator')

const UserSchema = mongoose.Schema({
    first_name: {
        type: String, 
        required: true,
        trim: true
    },
    last_name:{
        type: String,
        required: false,
        trim: true,
    },
    email_id:{
        type: String, 
        required: true,
        trim: true, 
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid')
            }
        }
    },
    password:{
        type: String, 
        required: true,
    },
    phone_no:{
        type: Number,
        required: false
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
})

const User = mongoose.model('User', UserSchema)
module.exports = User