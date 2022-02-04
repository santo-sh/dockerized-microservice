const mongoose = require('mongoose')

const UserInteractionSchema = {
    content_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    likes:{
        type: Number,
        required: true
    },
    reads:{
        type: Number,
        required: true
    }
}

const UserInteraction = mongoose.model('UserInteraction', UserInteractionSchema)
module.exports = UserInteraction