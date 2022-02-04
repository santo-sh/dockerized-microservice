const mongoose = require('mongoose')

const ContentSchema = new mongoose.Schema({
    title:{
        type: String, 
        required: true, 
        trim: true
    },
    story:{
        type: String,
        required: true,
    },
    publish_date:{
        type: Date,
        required: true
    },
    user_id:{
        type: String,
        required: true
    }
})

const Content = mongoose.model('Content', ContentSchema)
module.exports = Content