const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type : String,
        required: true
    },
    description:{
        type : String,
        required: true
    },
    price :{ 
        type : Number,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
    category:{
        type:  mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required: true
    },
    image:{
        type: Array,
        required:true
    },
    Stock:{
        type:Boolean,
    },
    list:{
        type:Boolean,
        default: true,
        required: true
    }


})

module.exports = mongoose.model('Products',productSchema) 
