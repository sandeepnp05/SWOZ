const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    is_verified: {
        type: Boolean,
        default: false 
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    address: [
        {
            firstname: {
                type: String,
            },
            lastname: {
                type: String,
            },
            housename: {
                type: String,
            },
            city: {
                type: String,
            },
            district: {  
                type: String,
            },
            state: {
                type: String,
            },
            mobile: {
                type: Number,
            },
            pincode: {
                type: Number,
            }
        }
    ]
})

module.exports = mongoose.model('User', userSchema);
