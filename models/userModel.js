
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
     
    firstname : {
        type : String,
        required : true
    },
    lastname : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique:true

    },
    phone : {
        type : Number,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    is_admin : {
        type : Number,
        default : 0 
    },
    is_verified : {
        type : Number,
        default : 1
    }
})

module.exports = mongoose.model('User' , userSchema)